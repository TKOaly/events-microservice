terraform {
  backend "s3" {
    region = "eu-west-1"
    bucket = "event-service-state"
    key    = "event-service-state"
  }
}

provider "aws" {
  profile = "tekis"
  region = "eu-west-1"
}

data "aws_ssm_parameter" "event_service_db_host" {
  name = "event-service-db-host"
}

data "aws_ssm_parameter" "event_service_db_port" {
  name = "event-service-db-port"
}

data "aws_ssm_parameter" "event_service_db_user" {
  name = "event-service-db-user"
}

data "aws_ssm_parameter" "event_service_db_password" {
  name = "event-service-db-password"
}

data "aws_ssm_parameter" "event_service_db_name" {
  name = "event-service-db-name"
}

data "aws_acm_certificate" "certificate" {
  domain = "*.tko-aly.fi"
}

data "aws_ssm_parameter" "event_service_auth_token" {
  name = "event-service-auth-token"
}

data "aws_vpc" "tekis_vpc" {
  filter {
    name   = "tag:Name"
    values = ["tekis-VPC"]
  }
}

data "aws_subnet_ids" "event_service_subnets" {
  vpc_id = "${data.aws_vpc.tekis_vpc.id}"
  filter {
    name   = "tag:Name"
    values = ["tekis-private-subnet-1a", "tekis-private-subnet-1b"]
  }
}

data "aws_subnet_ids" "public_subnets" {
  vpc_id = "${data.aws_vpc.tekis_vpc.id}"
  filter {
    name   = "tag:Name"
    values = ["tekis-public-subnet-1a", "tekis-public-subnet-1b"]
  }
}

data "aws_ecr_repository" "event_service_repo" {
  name = "events-service"
}

data "aws_ecs_cluster" "cluster" {
  cluster_name = "christina-regina"
}

resource "aws_iam_role" "event_service_execution_role" {
  name               = "event-service-execution-role"
  assume_role_policy = <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Action": "sts:AssumeRole",
      "Principal": {
        "Service": "ecs-tasks.amazonaws.com"
      },
      "Effect": "Allow",
      "Sid": ""
    }
  ]
}
EOF
}

resource "aws_iam_role_policy" "event_service_execution_role_policy" {
  name = "event-service-execution-role-policy"
  role = "${aws_iam_role.event_service_execution_role.id}"

  policy = <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Action": [
        "ecr:GetAuthorizationToken",
        "ecr:BatchCheckLayerAvailability",
        "ecr:GetDownloadUrlForLayer",
        "ecr:BatchGetImage",
        "logs:CreateLogStream",
        "logs:PutLogEvents",
        "ssm:GetParameter",
        "ssm:GetParameters"
      ],
      "Effect": "Allow",
      "Resource": "*"
    }
  ]
}
EOF
}

resource "aws_security_group" "event_service_task_sg" {
  name   = "event-service-task-sg"
  vpc_id = "${data.aws_vpc.tekis_vpc.id}"

  ingress {
    from_port   = 3001
    to_port     = 3001
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

resource "aws_security_group" "event_service_load_balancer_sg" {
  name   = "event-service-load-balancer-sg"
  vpc_id = "${data.aws_vpc.tekis_vpc.id}"

  ingress {
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

resource "aws_lb" "event_service_lb" {
  name               = "event-service-lb"
  internal           = false
  load_balancer_type = "application"
  security_groups    = ["${aws_security_group.event_service_load_balancer_sg.id}"]
  subnets            = "${data.aws_subnet_ids.public_subnets.ids}"

  enable_deletion_protection = true
}

resource "aws_alb_target_group" "event_service_lb_target_group" {
  name        = "cb-target-group"
  port        = 3001
  protocol    = "HTTP"
  vpc_id      = "${data.aws_vpc.tekis_vpc.id}"
  target_type = "ip"

  health_check {
    path = "/ping"
    matcher = 200
  }
}

resource "aws_alb_listener" "event_service_lb_listener" {
  load_balancer_arn = "${aws_lb.event_service_lb.arn}"
  port              = 443
  protocol          = "HTTPS"
  certificate_arn   = "${data.aws_acm_certificate.certificate.arn}"

  default_action {
    target_group_arn = "${aws_alb_target_group.event_service_lb_target_group.arn}"
    type             = "forward"
  }
}

resource "aws_cloudwatch_log_group" "event_service_cw" {
  name = "/ecs/christina-regina/event-service"
}

resource "aws_ecs_task_definition" "event_serivce_task" {
  family                   = "service"
  network_mode             = "awsvpc"
  requires_compatibilities = ["FARGATE"]
  cpu                      = 256
  memory                   = 512
  execution_role_arn       = "${aws_iam_role.event_service_execution_role.arn}"
  container_definitions    = <<DEFINITION
[
  {
    "name": "event_service_task",
    "image": "${data.aws_ecr_repository.event_service_repo.repository_url}:latest",
    "cpu": 256,
    "memory": null,
    "memoryReservation": null,
    "essential": true,
    "portMappings": [{
      "containerPort": 3001,
      "hostPort": 3001,
      "protocol": "tcp"
    }],
    "logConfiguration": {
      "logDriver": "awslogs",
      "options": {
        "awslogs-group": "${aws_cloudwatch_log_group.event_service_cw.name}",
        "awslogs-region": "eu-west-1",
        "awslogs-stream-prefix": "ecs",
        "awslogs-datetime-format": "%Y-%m-%d %H:%M:%S"
      }
    },
    "environment": [
      {"name": "SERVICE_PORT", "valueFrom": "3001"}
    ],
    "secrets": [
      {"name": "DB_HOST", "valueFrom": "${data.aws_ssm_parameter.event_service_db_host.arn}"},
      {"name": "DB_PORT", "valueFrom": "${data.aws_ssm_parameter.event_service_db_port.arn}"},
      {"name": "DB_USER", "valueFrom": "${data.aws_ssm_parameter.event_service_db_user.arn}"},
      {"name": "DB_PASSWORD", "valueFrom": "${data.aws_ssm_parameter.event_service_db_password.arn}"},
      {"name": "DB_NAME", "valueFrom": "${data.aws_ssm_parameter.event_service_db_name.arn}"},
      {"name": "SERVICE_AUTH_TOKEN", "valueFrom": "${data.aws_ssm_parameter.event_service_auth_token.arn}"}
    ]
  }
]
DEFINITION
}

resource "aws_ecs_service" "event_service" {
  name            = "event-service"
  cluster         = "${data.aws_ecs_cluster.cluster.id}"
  task_definition = "${aws_ecs_task_definition.event_serivce_task.arn}"
  desired_count   = 1
  launch_type     = "FARGATE"

  network_configuration {
    security_groups = ["${aws_security_group.event_service_task_sg.id}"]
    subnets         = "${data.aws_subnet_ids.event_service_subnets.ids}"
  }

  load_balancer {
    target_group_arn = "${aws_alb_target_group.event_service_lb_target_group.arn}"
    container_name   = "event_service_task"
    container_port   = 3001
  }

  depends_on = [
    aws_lb.event_service_lb,
    aws_alb_listener.event_service_lb_listener,
    aws_alb_target_group.event_service_lb_target_group
  ]
}

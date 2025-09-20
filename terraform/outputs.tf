# After Dark Systems - Terraform Outputs
# Entertainment Technology Ecosystem Infrastructure

output "vpc_id" {
  description = "VPC ID"
  value       = aws_vpc.main.id
}

output "public_subnet_ids" {
  description = "Public subnet IDs"
  value       = aws_subnet.public[*].id
}

output "private_subnet_ids" {
  description = "Private subnet IDs"
  value       = aws_subnet.private[*].id
}

output "alb_dns_name" {
  description = "Application Load Balancer DNS name"
  value       = aws_lb.main.dns_name
}

output "alb_zone_id" {
  description = "Application Load Balancer Zone ID"
  value       = aws_lb.main.zone_id
}

output "alb_arn" {
  description = "Application Load Balancer ARN"
  value       = aws_lb.main.arn
}

output "ecs_cluster_name" {
  description = "ECS cluster name"
  value       = aws_ecs_cluster.main.name
}

output "ecs_cluster_arn" {
  description = "ECS cluster ARN"
  value       = aws_ecs_cluster.main.arn
}

output "ssl_certificate_arn" {
  description = "SSL certificate ARN"
  value       = aws_acm_certificate_validation.main.certificate_arn
}

output "route53_zone_id" {
  description = "Route 53 hosted zone ID"
  value       = data.aws_route53_zone.main.zone_id
}

output "main_site_service_name" {
  description = "Main site ECS service name"
  value       = aws_ecs_service.main_site.name
}

output "login_service_name" {
  description = "Login service ECS service name"
  value       = aws_ecs_service.login_service.name
}

output "api_gateway_service_name" {
  description = "API Gateway ECS service name"
  value       = aws_ecs_service.api_gateway.name
}

output "cloudwatch_log_groups" {
  description = "CloudWatch log groups"
  value = {
    main_site     = aws_cloudwatch_log_group.main_site.name
    login_service = aws_cloudwatch_log_group.login_service.name
    api_gateway   = aws_cloudwatch_log_group.api_gateway.name
  }
}

output "security_groups" {
  description = "Security group IDs"
  value = {
    alb = aws_security_group.alb.id
    ecs = aws_security_group.ecs.id
  }
}

output "target_groups" {
  description = "Target group ARNs"
  value = {
    main_site     = aws_lb_target_group.main_site.arn
    login_service = aws_lb_target_group.login_service.arn
    api_gateway   = aws_lb_target_group.api_gateway.arn
  }
}

output "subdomain_urls" {
  description = "All subdomain URLs"
  value = {
    main_site     = "https://${var.domain_name}"
    www           = "https://www.${var.domain_name}"
    login         = "https://login.${var.domain_name}"
    api           = "https://api.${var.domain_name}"
    admin         = "https://admin.${var.domain_name}"
    docs          = "https://docs.${var.domain_name}"
    billing       = "https://billing.${var.domain_name}"
    status        = "https://status.${var.domain_name}"
    analytics     = "https://analytics.${var.domain_name}"
    oss           = "https://oss.${var.domain_name}"
    sip           = "https://sip.${var.domain_name}"
    webhooks      = "https://webhooks.${var.domain_name}"
    cdn           = "https://cdn.${var.domain_name}"
  }
}

output "deployment_info" {
  description = "Deployment information for SuperDeploy"
  value = {
    project_name     = var.project_name
    environment      = var.environment
    cluster_name     = aws_ecs_cluster.main.name
    vpc_id           = aws_vpc.main.id
    domain_name      = var.domain_name
    ssl_cert_arn     = aws_acm_certificate_validation.main.certificate_arn
    services = {
      main_site = {
        name            = aws_ecs_service.main_site.name
        task_definition = aws_ecs_task_definition.main_site.arn
        target_group    = aws_lb_target_group.main_site.arn
      }
      login_service = {
        name            = aws_ecs_service.login_service.name
        task_definition = aws_ecs_task_definition.login_service.arn
        target_group    = aws_lb_target_group.login_service.arn
      }
      api_gateway = {
        name            = aws_ecs_service.api_gateway.name
        task_definition = aws_ecs_task_definition.api_gateway.arn
        target_group    = aws_lb_target_group.api_gateway.arn
      }
    }
  }
}
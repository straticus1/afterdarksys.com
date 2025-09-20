# After Dark Systems - Terraform Variables
# Entertainment Technology Ecosystem Infrastructure

variable "aws_region" {
  description = "AWS region for deployment"
  type        = string
  default     = "us-east-1"
}

variable "environment" {
  description = "Environment name (dev, staging, production)"
  type        = string
  default     = "production"
}

variable "project_name" {
  description = "Project name for resource naming"
  type        = string
  default     = "afterdarksys"
}

variable "domain_name" {
  description = "Domain name for the application"
  type        = string
  default     = "afterdarksys.com"
}

variable "vpc_cidr" {
  description = "CIDR block for VPC"
  type        = string
  default     = "10.0.0.0/16"
}

variable "availability_zones" {
  description = "Number of availability zones to use"
  type        = number
  default     = 2
}

# ECS Configuration
variable "ecs_desired_count" {
  description = "Desired number of ECS tasks"
  type        = number
  default     = 2
}

variable "ecs_min_capacity" {
  description = "Minimum number of ECS tasks"
  type        = number
  default     = 1
}

variable "ecs_max_capacity" {
  description = "Maximum number of ECS tasks"
  type        = number
  default     = 10
}

# Application Configuration
variable "main_site_cpu" {
  description = "CPU units for main site service"
  type        = number
  default     = 256
}

variable "main_site_memory" {
  description = "Memory (MB) for main site service"
  type        = number
  default     = 512
}

variable "login_service_cpu" {
  description = "CPU units for login service"
  type        = number
  default     = 256
}

variable "login_service_memory" {
  description = "Memory (MB) for login service"
  type        = number
  default     = 512
}

variable "api_gateway_cpu" {
  description = "CPU units for API gateway service"
  type        = number
  default     = 512
}

variable "api_gateway_memory" {
  description = "Memory (MB) for API gateway service"
  type        = number
  default     = 1024
}

# Container Images
variable "main_site_image" {
  description = "Docker image for main site"
  type        = string
  default     = "nginx:alpine"
}

variable "login_service_image" {
  description = "Docker image for login service"
  type        = string
  default     = "afterdarksys/login-service:latest"
}

variable "api_gateway_image" {
  description = "Docker image for API gateway"
  type        = string
  default     = "afterdarksys/api-gateway:latest"
}

# Database Configuration (for future RDS deployment)
variable "db_instance_class" {
  description = "RDS instance class"
  type        = string
  default     = "db.t3.micro"
}

variable "db_allocated_storage" {
  description = "RDS allocated storage (GB)"
  type        = number
  default     = 20
}

variable "db_engine_version" {
  description = "RDS engine version"
  type        = string
  default     = "8.0"
}

# Monitoring and Alerting
variable "enable_cloudwatch_insights" {
  description = "Enable CloudWatch Container Insights"
  type        = bool
  default     = true
}

variable "log_retention_days" {
  description = "CloudWatch log retention in days"
  type        = number
  default     = 7
}

# Auto Scaling
variable "cpu_target_value" {
  description = "Target CPU utilization for auto scaling"
  type        = number
  default     = 70
}

variable "memory_target_value" {
  description = "Target memory utilization for auto scaling"
  type        = number
  default     = 80
}

# Security
variable "ssl_policy" {
  description = "SSL policy for ALB"
  type        = string
  default     = "ELBSecurityPolicy-TLS-1-2-2017-01"
}

variable "certificate_transparency_logging" {
  description = "Enable certificate transparency logging"
  type        = bool
  default     = true
}

# Tags
variable "additional_tags" {
  description = "Additional tags to apply to resources"
  type        = map(string)
  default = {
    Owner       = "AfterDarkSystems"
    ManagedBy   = "SuperDeploy"
    CostCenter  = "Infrastructure"
    Project     = "EntertainmentEcosystem"
  }
}
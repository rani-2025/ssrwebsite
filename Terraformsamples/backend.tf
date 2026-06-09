terraform {
  backend "s3" {
    bucket = "terraform-july-tfstate"
    key = "terraform.tfstate"
    region = "us-east-1"
    encrypt = true
    use_lockfile = true // in 2024 added this, before.. dynamob_table = "value"
 
  }
}
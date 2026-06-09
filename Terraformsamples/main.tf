# First create an IAM policy that allows S3 bucket creation
resource "aws_iam_policy" "s3_bucket_policy" {
  name        = "S3BucketCreationPolicy"
  description = "Policy to allow S3 bucket creation"
  
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = [
          "s3:CreateBucket",
          "s3:ListBucket",
          "s3:GetBucketLocation",
          "s3:PutBucketTagging"
        ]
        Effect   = "Allow"
        Resource = "arn:aws:s3:::*"
      }
    ]
  })
}

# Attach the policy to the user
resource "aws_iam_user_policy_attachment" "user_policy_attach" {
  user       = "terraforn_user"  # Your IAM user name
  policy_arn = aws_iam_policy.s3_bucket_policy.arn
}

# Create the S3 bucket after the policy is attached
resource "aws_s3_bucket" "mysc3" {
  bucket = "12344bucket-unique-suffix" # Make sure this is globally unique
  depends_on = [aws_iam_user_policy_attachment.user_policy_attach]
}

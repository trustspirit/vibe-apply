#!/bin/bash

set -e

# Configuration
PROJECT_ID="application-56bde"
REGION="asia-northeast3"
SERVICE_NAME="vibe-api"
IMAGE_NAME="asia-northeast3-docker.pkg.dev/${PROJECT_ID}/vibe/vibe-api"
DOCKERFILE_PATH="apps/backend/Dockerfile"
ENV_FILE="cloud-run-env.yaml"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}=== Cloud Run Deployment with Environment Variables ===${NC}"
echo ""

# Check if gcloud is installed
if ! command -v gcloud &> /dev/null; then
    echo -e "${RED}Error: gcloud CLI is not installed${NC}"
    exit 1
fi

# Check if docker is running
if ! docker info &> /dev/null; then
    echo -e "${RED}Error: Docker is not running${NC}"
    exit 1
fi

# Check if env file exists
if [ ! -f "${ENV_FILE}" ]; then
    echo -e "${RED}Error: Environment file ${ENV_FILE} not found${NC}"
    exit 1
fi

# Parse command line arguments
TAG="latest"

while [[ $# -gt 0 ]]; do
    case $1 in
        --tag)
            TAG="$2"
            shift 2
            ;;
        --help)
            echo "Usage: ./deploy-with-env.sh [OPTIONS]"
            echo ""
            echo "Options:"
            echo "  --tag TAG          Set image tag (default: latest)"
            echo "  --help             Show this help message"
            exit 0
            ;;
        *)
            echo -e "${RED}Unknown option: $1${NC}"
            exit 1
            ;;
    esac
done

IMAGE_TAG="${IMAGE_NAME}:${TAG}"

echo -e "${YELLOW}Configuration:${NC}"
echo "  Project ID: ${PROJECT_ID}"
echo "  Region: ${REGION}"
echo "  Service Name: ${SERVICE_NAME}"
echo "  Image: ${IMAGE_TAG}"
echo "  Env File: ${ENV_FILE}"
echo ""

# Step 1: Build Docker image
echo -e "${GREEN}Step 1: Building Docker image for linux/amd64...${NC}"
docker buildx build \
    --platform linux/amd64 \
    -t "${IMAGE_TAG}" \
    -f "${DOCKERFILE_PATH}" \
    .
echo -e "${GREEN}✓ Build completed${NC}"
echo ""

# Step 2: Push to Artifact Registry
echo -e "${GREEN}Step 2: Pushing image to Artifact Registry...${NC}"
docker push "${IMAGE_TAG}"
echo -e "${GREEN}✓ Push completed${NC}"
echo ""

# Step 3: Deploy to Cloud Run with environment variables
echo -e "${GREEN}Step 3: Deploying to Cloud Run with environment variables...${NC}"
gcloud run deploy "${SERVICE_NAME}" \
    --image="${IMAGE_TAG}" \
    --region="${REGION}" \
    --platform=managed \
    --allow-unauthenticated \
    --env-vars-file="${ENV_FILE}"

echo ""
echo -e "${GREEN}✓ Deployment completed successfully!${NC}"
echo ""

# Get service URL
SERVICE_URL=$(gcloud run services describe "${SERVICE_NAME}" \
    --region="${REGION}" \
    --format='value(status.url)')

echo -e "${GREEN}Service URL: ${SERVICE_URL}${NC}"
echo ""

# Health check
echo -e "${YELLOW}Performing health check...${NC}"
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "${SERVICE_URL}/api")

if [ "$HTTP_CODE" = "200" ]; then
    echo -e "${GREEN}✓ Health check passed (HTTP ${HTTP_CODE})${NC}"
else
    echo -e "${RED}✗ Health check failed (HTTP ${HTTP_CODE})${NC}"
    exit 1
fi

echo ""
echo -e "${GREEN}=== Deployment Complete ===${NC}"

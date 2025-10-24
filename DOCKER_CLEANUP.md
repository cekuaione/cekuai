# Docker Image Cleanup for GitHub Actions

## Overview

This document describes the automatic Docker image cleanup functionality added to the GitHub Actions deployment workflows to prevent disk space issues on the OCI VM.

## Problem Solved

- **Disk Space Issue**: OCI VM disk was filling up (45GB → 41GB was build cache)
- **Accumulating Images**: Every deploy creates new Docker images but old ones never get deleted
- **Storage Waste**: Old Docker images were consuming significant disk space

## Solution Implemented

### Automatic Cleanup Step

Added a cleanup step to both deployment workflows that:
1. **Keeps only the 3 most recent cekuai Docker images**
2. **Deletes all older cekuai images**
3. **Runs after successful deployment**
4. **Doesn't fail the workflow if cleanup fails**

### Cleanup Logic

```bash
docker images --format "{{.Repository}}:{{.Tag}}\t{{.ID}}\t{{.CreatedAt}}" | 
grep cekuai | 
sort -k3 -r | 
tail -n +4 | 
awk "{print \$2}" | 
xargs -r docker rmi -f || true
```

**Step-by-step explanation:**
1. `docker images --format "{{.Repository}}:{{.Tag}}\t{{.ID}}\t{{.CreatedAt}}"` - List all Docker images with custom format
2. `grep cekuai` - Filter only cekuai images
3. `sort -k3 -r` - Sort by creation date (newest first)
4. `tail -n +4` - Skip first 3 images (keep most recent 3)
5. `awk "{print \$2}"` - Extract image IDs
6. `xargs -r docker rmi -f` - Delete those images
7. `|| true` - Ensure command doesn't fail if no images to delete

## Workflows Modified

### 1. Production Deployment (`.github/workflows/deploy.yml`)

- **Trigger**: Push to `main` branch or manual workflow dispatch
- **Cleanup**: Keeps 3 most recent production cekuai images
- **Location**: After deployment, before "Display info" step

### 2. Test Deployment (`.github/workflows/deploy-test.yml`)

- **Trigger**: Push to `test` branch or manual workflow dispatch
- **Cleanup**: Keeps 3 most recent test cekuai images
- **Location**: After deployment, before "Display info" step

## Implementation Details

### Cleanup Step Configuration

```yaml
- name: Cleanup old Docker images
  run: |
    ssh -i ~/.ssh/oci_key ubuntu@${{ secrets.OCI_HOST }} '
      echo "🧹 Cleaning up old Docker images..."
      docker images --format "{{.Repository}}:{{.Tag}}\t{{.ID}}\t{{.CreatedAt}}" | 
      grep cekuai | 
      sort -k3 -r | 
      tail -n +4 | 
      awk "{print \$2}" | 
      xargs -r docker rmi -f || true
      echo "✅ Docker image cleanup completed"
    '
  continue-on-error: true
```

### Key Features

- **Non-blocking**: `continue-on-error: true` ensures deployment succeeds even if cleanup fails
- **Safe**: Only deletes cekuai images, preserves other Docker images
- **Efficient**: Keeps 3 most recent images for rollback capability
- **Logged**: Provides clear feedback about cleanup process

## Benefits

1. **Disk Space Management**: Prevents disk space issues on OCI VM
2. **Automatic**: No manual intervention required
3. **Safe**: Preserves recent images for rollback capability
4. **Non-disruptive**: Doesn't affect deployment success
5. **Cost Effective**: Reduces storage costs on OCI

## Monitoring

### Check Cleanup Status

To monitor the cleanup process:

1. **View GitHub Actions logs**: Check the "Cleanup old Docker images" step in deployment logs
2. **Manual verification**: SSH into OCI VM and run:
   ```bash
   docker images | grep cekuai
   ```

### Expected Output

```
🧹 Cleaning up old Docker images...
✅ Docker image cleanup completed
```

## Troubleshooting

### If Cleanup Fails

The cleanup step is designed to be non-blocking. If it fails:

1. **Check logs**: Review the cleanup step logs in GitHub Actions
2. **Manual cleanup**: SSH into OCI VM and run cleanup manually
3. **Investigate**: Check for Docker daemon issues or permission problems

### Manual Cleanup

If automatic cleanup isn't working, you can run cleanup manually:

```bash
# SSH into OCI VM
ssh -i ~/.ssh/oci_key ubuntu@<OCI_HOST>

# Run cleanup manually
docker images --format "{{.Repository}}:{{.Tag}}\t{{.ID}}\t{{.CreatedAt}}" | 
grep cekuai | 
sort -k3 -r | 
tail -n +4 | 
awk '{print $2}' | 
xargs -r docker rmi -f
```

## Configuration

### Adjusting Number of Kept Images

To change the number of images kept (currently 3), modify the `tail -n +4` command:

- **Keep 2 images**: Change to `tail -n +3`
- **Keep 5 images**: Change to `tail -n +6`

### Adding Cleanup to Other Workflows

To add cleanup to other workflows, copy the cleanup step and adjust the SSH connection details as needed.

## Security Considerations

- **SSH Key**: Uses existing SSH key from GitHub Secrets
- **Permissions**: Runs with ubuntu user permissions on OCI VM
- **Scope**: Only affects cekuai Docker images
- **Safety**: Non-destructive to other Docker resources

## Future Enhancements

Potential improvements for the cleanup system:

1. **Configurable retention**: Make number of kept images configurable
2. **Size-based cleanup**: Clean up based on image size rather than count
3. **Scheduled cleanup**: Add periodic cleanup outside of deployments
4. **Metrics**: Add cleanup metrics and monitoring
5. **Notification**: Send notifications when cleanup fails

---

**Last Updated**: October 24, 2024
**Status**: ✅ Implemented and Active

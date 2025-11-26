# Security Policy

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 0.1.x   | :white_check_mark: |

## Reporting a Vulnerability

If you discover a security vulnerability in this project, please report it responsibly:

1. **Do NOT** open a public GitHub issue for security vulnerabilities
2. Email the maintainer directly or use GitHub's private vulnerability reporting
3. Include detailed information about the vulnerability:
   - Description of the issue
   - Steps to reproduce
   - Potential impact
   - Suggested fix (if any)

## Security Considerations

This project handles Power BI Embedded authentication. Please ensure:

### Environment Variables

- Never commit `.env.local` or files containing secrets
- Use `.env.example` as a template (contains no real values)
- Rotate `POWERBI_CLIENT_SECRET` regularly

### Azure AD Configuration

- Use least-privilege permissions for the service principal
- Restrict API permissions to only what's needed (`Report.ReadWrite.All`)
- Enable conditional access policies where appropriate
- Monitor Azure AD sign-in logs for suspicious activity

### Deployment

- Use HTTPS in production
- Set appropriate CORS policies
- Consider using Azure Key Vault for secret management
- Enable rate limiting on the `/api/powerbi` endpoint

## Dependencies

We regularly update dependencies to patch known vulnerabilities. Run:

```bash
pnpm audit
```

To check for known vulnerabilities in dependencies.

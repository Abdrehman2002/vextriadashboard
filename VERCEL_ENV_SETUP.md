# Vercel Environment Variables Setup

To deploy this application to Vercel, you need to configure the following environment variables:

## Required Environment Variables

Go to your Vercel project → Settings → Environment Variables and add:

### Google Service Account (for Calendar API)

```
GOOGLE_SERVICE_ACCOUNT_EMAIL=corah-501@corah-479001.iam.gserviceaccount.com
```

```
GOOGLE_PRIVATE_KEY=-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQDMkTlKfRTuaKra\nx7X3ExELBDEI5rNGBdiXRiRSKWQDS5lWRiASkpmu43b4XGGBwlzYvHX2pHdQKVKH\nalOY7e4PXSG/XjlSmZxsXkf8a9haya2Q4rACiNNXJbpJ72vQOOo3ydmI4TylYCNA\n0PsuHKmjLvFRXV5dSwKxhejTDe6Az45/MwnpXYcXg4qbLt7cWddDOSFMohuLTzDK\n4B+tBPgB+Uk94lgpAO1gIp9kZwZNq0YvFSXAAdko9KmvhyTIRcgfhPNzc31ljDiw\nUHkIjGRWd6HrTaTGqdbsnV6vXpLCn4UFUPi+lf/rRn3Mq9ni5AKep8RE2saNCaSZ\nZyCu+053AgMBAAECggEAF38QtQkT5+RWx4VL1cK3YOwM08hnzAGs5Ic2ccd2SNic\nlqe8VFXJWCihSBqYSoawEmbnJ7qxR6BPbeVdD8I4Z0RbtXbVn7KsIFhd7VTXx2nF\nyU/4Rno/yBE5yfc5i3OWF21UUqAITrhxpCa8ywmYxHkGV8GhLpcIiqpmWSOPAvVf\neVUEfrFzgsf6TRGZNSe15E9SGyWmM0VodF5nWuMGqgTr0rZ00GzgIIn/uy/qXkyC\nPNi7BJ7ooVu+dIJTyIhP6ZMBRPb9W0JE1GZwrkIuNgc88KMFuWF5HqPnPinwl4ZS\ni9fkVOj9yuA9E/u42KnY+i0gFvg+HWpPt9K3i8YTCQKBgQDveFyZT+HxHfaXZrWN\nU41RTCzM/xMZ+qGB3ks9ubNlCLfhnQ/XM00Nh5nzXq8STl0QCprSXW9hOKn1dj4d\nw+6MF1/oxkV6eEYy5y4S4RUvW4nib1NE4YMq2WHeR7xLqHEaP4L3wDrDTSNmH5GN\neqJHdqGqI9eGFjYbnL98fjuv/wKBgQDasBlS3muLOF1rj1kwHL1Ad7rHitVgCzmR\n9NVfVJZfMafphQcY4WBDK8QGXCWCkjocdDH1v1DxPQUCeBKWLlrtIrmqLZINzRjb\nKsfu7h1kJKABXP9YNmQXfM+7cQf0cguoaF46gkgrBdQO1+jOAETN1+EGCyr4lOAd\nH7ypxKXhiQKBgH1MWg8x+APEbMlNSYN4C0JVfD+K24DFXgpouK/EYbRkumoHV0l/\nozqIECqCCVKnxBPnqJiXoPaawnsX8mp6oW+Vr25JiAMLuZda1QW11fLgj6X2H/iz\nkoEyGv5GRKTFruBQCQP/BgA4dWQy8mK3nv+LeA1hEZ0sNAWAn8TQ/AQbAoGAO5fP\nXtCzl72lX4ExubWrMN0vrd68ZK7KYmbImnDPhWNfsXgJxhLsi4Fqqp0Dr8AvS7+y\nOZiH8yVArzqPPhOlvYc/9wryCQbB5j+TOh3zLm34mEaCYsR3pBrj9N1JYKiPWrYO\nL31/MxIkhmL50uEp3rocXOxAKntPU0Bpxg2LcpkCgYEA6DNYXJa8Xz0+IkmVWFwU\nc8UftOUEgX+vvUgUDzfx3OtKovRSNQ1mM5PCySJqb3YdTabAgjpINp69/nY2Bx6z\n8Rc9FphYlStBIixtEiE0xgLxPyaNNk+uscsvukkAs8I43McYvdH45REOCaqtzUcW\nM2Rq8XkWlm5n6yS0e76gvsI=\n-----END PRIVATE KEY-----\n
```

```
GOOGLE_PROJECT_ID=corah-479001
```

```
GOOGLE_CALENDAR_ID=1c82143bf911816e35b0a7ddfb78e629c24fdaa19ed90f38210e336c549129be@group.calendar.google.com
```

### Google Sheets (existing)

```
GOOGLE_SHEETS_SPREADSHEET_ID=1Uww2j5jNAZa1IN3o_EX_oLvzrg1idBhfdhSDXUREEbg
```

```
NEXT_PUBLIC_CORAH_SHEET_ID=1Uww2j5jNAZa1IN3o_EX_oLvzrg1idBhfdhSDXUREEbg
```

### Dashboard Passwords

```
ADMIN_DASHBOARD_PASSWORD=admin123
```

```
USER_DASHBOARD_PASSWORD=user123
```

## Important Notes

- **NEVER** commit `.env.local` to Git (it's already in `.gitignore`)
- The `GOOGLE_PRIVATE_KEY` must include `\n` for line breaks (as shown above)
- All variables are server-side only except `NEXT_PUBLIC_CORAH_SHEET_ID`
- After adding variables in Vercel, redeploy the application

## Security

- Service Account credentials are kept secure on the server
- No OAuth client secrets or refresh tokens needed
- Service Account has access ONLY to the specific Google Calendar

## How It Works

1. **Backend**: Service Account authenticates with Google Calendar API
2. **API Routes**: Server-side routes handle create/update/delete operations
3. **Frontend**: Dashboard UI calls API routes (never exposes credentials)
4. **Google Calendar**: Changes sync automatically to embedded calendar view

import { google } from 'googleapis'

export function getCalendarClient() {
  const auth = new google.auth.JWT(
    process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    undefined,
    process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    ['https://www.googleapis.com/auth/calendar']
  )

  return google.calendar({ version: 'v3', auth })
}

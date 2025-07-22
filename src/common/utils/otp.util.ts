export function otpGenerator() : number {
  return Math.floor(Math.random() * 900000) + 100000;
}

export function otpExpiry(expiryInMins : number) : Date {
  return new Date(Date.now() + expiryInMins * 60 * 1000);
}
export const ROLES ={
  ADMIN: 1,
  MANAGER: 2,
  EMPLOYEE: 3
} as const;

export const UNITS = {
  LB: "lb",
  OZ: "oz",
  U: "u",
  gl: "gl"
} as const;

export const ORDER_STATUS = {
  SUGGESTED: "SUGGESTED",
  REVISED: "REVISED",
  RECEIVED: "RECEIVED",
  ACCEPTED: "ACCEPTED"  
}
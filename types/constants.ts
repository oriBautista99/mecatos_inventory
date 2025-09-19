export const ROLES ={
  ADMIN: 1,
  MANAGER: 2,
  EMPLOYEE: 3
} as const;

export const UNITS = {
  LB: "lb",
  OZ: "oz",
  U: "u"
} as const;

export const ORDER_STATUS = {
  CREATED: "CREATED",
  SUGGESTED: "SUGGESTED",
  REVISED: "REVISED",
  ACCEPTED: "ACCEPTED",
  RECEIVED: "RECEIVED"
}
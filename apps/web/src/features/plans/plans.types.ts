// ── Domain types (match backend PlanDtos.cs) ─────────────────────────────────

export interface FamilySafetyPlan {
  id:                     string
  familyId:               string
  bookingId:              string
  sourceAssessmentId:     string | null
  assessmentOverallScore: number | null
  assessmentRiskLevel:    string | null
  topRisks:               string
  topPriorities:          string
  actionPlanByMember:     string
  actionPlanByDevice:     string
  status:                 string
  createdAt:              string
  updatedAt:              string
}

export interface IncidentRecoveryPack {
  id:               string
  familyId:         string
  bookingId:        string
  linkedIncidentId: string | null
  whatHappened:     string
  whatToDoNow:      string
  whatNotToDo:      string
  next24Hours:      string
  next7Days:        string
  status:           string
  createdAt:        string
  updatedAt:        string
}

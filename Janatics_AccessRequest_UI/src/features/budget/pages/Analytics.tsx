import { ArrowLeft } from "lucide-react"
import { BudgetAnalyticsSection } from "../components/analytics/BudgetAnalyticsSection"
import { Button } from "@/shared/components/ui/button"
import { useNavigate } from "react-router-dom"

function Analytics() {
  const navigate = useNavigate()

  return (
    <div className="m-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 text-sm">
          <Button
            variant="ghost"
            className="px-2"
            onClick={() => {
              navigate("/budget/plan-entry")
            }}
          >
            <ArrowLeft className="mr-2 inline-block size-5 text-muted-foreground" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              Budget Variance & Analysis
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              NPD-2025-07 · XYZ Series 5/2 Pneumatic Solenoid Valve · Prototype
              Development
            </p>
          </div>
        </div>
      </div>
      <BudgetAnalyticsSection />
    </div>
  )
}

export default Analytics

import { useAuth } from "@/providers/auth-provider"
import { Button } from "@/shared/components/ui/button"
import { useEffect, useMemo, useState } from "react"
import { useLocation, useNavigate } from "react-router-dom"
import { BudgetTable } from "../components/plan-entry/BudgetTable"
import { ProjectHeader } from "../components/plan-entry/ProjectHeader"
import type { BudgetRecord } from "../types"

const DRAFT_KEY_PREFIX = "budget-plan-entry-draft"

const DEFAULT_CATEGORIES = [
  {
    category: "Personnel",
    items: [
      { name: "Labor cost", planned: 0, actual: 0 },
      { name: "Consulting fees", planned: 0, actual: 0 },
    ],
  },
  {
    category: "Materials",
    items: [
      { name: "Consumables", planned: 0, actual: 0 },
      { name: "Prototype parts", planned: 0, actual: 0 },
    ],
  },
  {
    category: "Equipment",
    items: [
      { name: "Machinery", planned: 0, actual: 0 },
      { name: "Test instruments", planned: 0, actual: 0 },
    ],
  },
]

function createBudgetRecord(input: {
  productName: string
  projectCode: string
  productNo: string
}): BudgetRecord {
  return {
    id: `draft-${Date.now()}`,
    projectHeader: {
      productName: input.productName,
      projectCode: input.projectCode,
      productNo: input.productNo,
      phase: "Product development",
      department: "Research and Development",
      status: "ON TRACK",
      lastUpdated: new Date().toISOString(),
    },
    budgetData: DEFAULT_CATEGORIES,
  }
}

export default function PlanEntry() {
  const location = useLocation()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [activeRecord, setActiveRecord] = useState<BudgetRecord | null>(null)

  const draftKey = useMemo(
    () => `${DRAFT_KEY_PREFIX}:${user?.employeeId ?? "guest"}`,
    [user?.employeeId]
  )

  useEffect(() => {
    const state = location.state as
      | {
          fromDashboard?: boolean
          inputData?: {
            productName: string
            projectCode: string
            productNo: string
          }
        }
      | null

    if (state?.inputData) {
      setActiveRecord(createBudgetRecord(state.inputData))
      return
    }

    const rawDraft = window.localStorage.getItem(draftKey)
    if (!rawDraft) {
      return
    }

    try {
      const parsed = JSON.parse(rawDraft) as BudgetRecord
      if (parsed?.id && parsed.projectHeader?.projectCode) {
        setActiveRecord(parsed)
      }
    } catch {
      window.localStorage.removeItem(draftKey)
    }
  }, [draftKey, location.state])

  useEffect(() => {
    if (!activeRecord) {
      return
    }
    window.localStorage.setItem(draftKey, JSON.stringify(activeRecord))
  }, [activeRecord, draftKey])

  const saveDraft = async () => {
    if (!activeRecord) {
      return
    }
    window.localStorage.setItem(draftKey, JSON.stringify(activeRecord))
  }

  const discardDraft = () => {
    window.localStorage.removeItem(draftKey)
    setActiveRecord(null)
    navigate("/budget/dashboard")
  }

  const exportCsv = () => {
    if (!activeRecord) {
      return
    }

    const rows: string[] = [
      "Category,Cost Item,Planned (INR),Actual (INR),Variance (INR),Variance (%)",
    ]

    activeRecord.budgetData.forEach((category) => {
      category.items.forEach((item) => {
        const variance = item.planned - item.actual
        const variancePercent = item.planned > 0 ? (variance / item.planned) * 100 : 0
        rows.push(
          [
            category.category,
            item.name,
            item.planned,
            item.actual,
            variance,
            variancePercent.toFixed(1),
          ]
            .map((value) => `"${String(value).replaceAll('"', '""')}"`)
            .join(",")
        )
      })
    })

    const blob = new Blob([rows.join("\n")], {
      type: "text/csv;charset=utf-8;",
    })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = `${activeRecord.projectHeader.projectCode.toLowerCase()}-budget.csv`
    link.click()
    URL.revokeObjectURL(url)
  }

  const handleRecordChange = (updatedRecord: BudgetRecord) => {
    setActiveRecord(updatedRecord)
  }

  if (!activeRecord) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center px-6 py-12">
        <div className="max-w-xl rounded-3xl border border-border bg-card p-10 text-center shadow-sm">
          <h1 className="mb-4 text-2xl font-semibold text-foreground">No budget selected</h1>
          <p className="mb-6 text-sm text-muted-foreground">
            Use the dashboard to search for a project or create a new budget record first.
          </p>
          <Button onClick={() => navigate("/budget/dashboard")}>Return to dashboard</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col">
      <div className="h-full flex-1 overflow-auto py-5">
        <ProjectHeader
          record={activeRecord}
          onSaveDraft={saveDraft}
          onDiscardDraft={discardDraft}
          onExportCsv={exportCsv}
        />
        <BudgetTable record={activeRecord} onRecordChange={handleRecordChange} />
      </div>
    </div>
  )
}

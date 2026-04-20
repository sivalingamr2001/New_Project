"use client"

import { useMemo, useState } from "react"
import { useNavigate } from "react-router-dom"
import { Plus } from "lucide-react"
import { toast } from "sonner"

import DataGrid from "@/features/DynamicGrid/components/DataGrid/DataGrid"
import { Button } from "@/shared/components/ui/button"
import { ProjectInformation } from "../components/ProjectInformation"
import CreateBudgetModal from "../components/CreateBudgetModal"

export default function Dashboard() {
  const [budgetData, setBudgetData] = useState<any[]>([])
  const [hasSearched, setHasSearched] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)

  // Track search params to auto-fill the modal
  const [searchParams, setSearchParams] = useState({
    productNumber: "",
    projectNumber: "",
  })

  const navigate = useNavigate()

  const summaryText = useMemo(
    () =>
      "Welcome to the Janatics Budget Portal. Use the dashboard to review your active R&D projects, then create or search for project records using the quick actions below.",
    []
  )

  const columnDefs = useMemo(
    () => [
      {
        field: "ProjectTitle",
        headerName: "Project Title",
        flex: 1,
        minWidth: 200,
      },
      { field: "projectNo", headerName: "Project Number", flex: 1 },
      { field: "productNo", headerName: "Product Number", flex: 1 },
      {
        field: "status",
        headerName: "Status",
        flex: 1,
        cellRenderer: (params: any) => {
          const isApproved = params.value === "true" || params.value === true
          return (
            <span
              className={`font-semibold ${isApproved ? "text-green-600" : "text-red-500"}`}
            >
              {isApproved ? "Approved" : "Pending"}
            </span>
          )
        },
      },
    ],
    []
  )

  // Updated handler to receive both the data and the search criteria
  const handleDataUpdate = (
    data: any,
    params: { productNumber: string; projectNumber: string }
  ) => {
    setSearchParams(params)

    const isNotFound = data?.status === 404 || data?.title === "Not found"

    if (isNotFound) {
      setBudgetData([])
    } else {
      const normalizedData = Array.isArray(data) ? data : data ? [data] : []
      setBudgetData(normalizedData)
    }
    setHasSearched(true)
  }

  async function handleNavigateToPlanEntry(input: {
    productName: string
    projectCode: string
    productNo: string
  }) {
    if (input) {
      toast.success(
        "Draft budget record created. Complete the plan entry to save it."
      )
      setIsModalOpen(false)
      navigate("/budget/plan-entry", {
        state: { fromDashboard: true, inputData: input },
      })
    } else {
      toast.error("Failed to create a new budget record.")
    }
  }

  return (
    <div className="flex flex-col gap-8 p-6 md:p-4">
      <header className="rounded-sm border border-border bg-card/80 p-6 shadow-sm backdrop-blur md:p-8">
        <div className="max-w-fit">
          <p className="text-sm tracking-[0.24em] text-muted-foreground uppercase">
            Portal overview
          </p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
            Budget management for R&D projects made simple.
          </h1>
          <p className="mt-4 max-w-2xl text-muted-foreground">{summaryText}</p>
        </div>
      </header>

      <main className="space-y-6">
        {/* Pass the updated handler to ProjectInformation */}
        <ProjectInformation onDataReceived={handleDataUpdate} />

        {hasSearched && (
          <div className="animate-in duration-500 fade-in slide-in-from-bottom-4">
            <DataGrid
              rowData={budgetData}
              columnDefs={columnDefs}
              title="Budget Records"
              gridId="budget-grid"
              noRowsMessage="No budget record found for this selection"
              showSearch={false}
              showRefreshButton={false}
              showClearFiltersButton={false}
              showExportCsvButton={false}
              showSelectedCount={true}
              gridHeight="auto"
              toolbarRight={
                budgetData.length === 0 && (
                  <Button
                    size="sm"
                    className="gap-2"
                    onClick={() => setIsModalOpen(true)}
                  >
                    <Plus className="h-4 w-4" />
                    Create New Budget
                  </Button>
                )
              }
            />
          </div>
        )}

        <CreateBudgetModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSubmit={handleNavigateToPlanEntry}
          // Pre-populate modal with search criteria
          initialData={{
            productName: "",
            productNo: searchParams.productNumber,
            projectCode: searchParams.projectNumber,
          }}
        />
      </main>
    </div>
  )
}

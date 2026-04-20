import type { AxiosResponse } from "axios";
import { apiService, type ApiResponse } from "@/shared/lib/api-client";

export type HodSummaryDto = {
  employeeId: number;
  firstName: string;
  lastName: string;
  email: string;
  mobile: string;
  role: string;
};

export type DepartmentDto = {
  departmentId: number;
  departmentName: string;
  createdOn: string;
  updatedOn: string;
  hodId: number | null;
  hod: HodSummaryDto | null;
};

export type PagedResult<T> = {
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  data: T[];
};

const handleResponse = async <T>(promise: Promise<AxiosResponse<ApiResponse<T>>>) => {
  const response = await promise;
  return response.data.data;
};

export const departmentApi = {
  getDepartments: (pageNumber = 1, pageSize = 25) =>
    handleResponse<PagedResult<DepartmentDto>>(
      apiService.get<ApiResponse<PagedResult<DepartmentDto>>>("/departments", {
        params: {
          pageNumber,
          pageSize,
        },
      })
    ),
};

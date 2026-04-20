import type { AxiosResponse } from "axios";
import { apiService, type ApiResponse } from "@/shared/lib/api-client";

export type HodDto = {
  employeeId: number;
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  mobile: string;
  location: string;
  role: string;
  isActive: boolean;
};

export type DepartmentDetailDto = {
  departmentId: number;
  departmentName: string;
  hod: HodDto | null;
};

export type EmployeeDto = {
  employeeId: number;
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  mobile: string;
  location: string;
  role: string;
  isActive: boolean;
  createdOn: string;
  updatedOn: string;
  departmentId: number;
  department: DepartmentDetailDto | null;
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

export const employeeApi = {
  getEmployees: (pageNumber = 1, pageSize = 25) =>
    handleResponse<PagedResult<EmployeeDto>>(
      apiService.get<ApiResponse<PagedResult<EmployeeDto>>>("/employees", {
        params: {
          pageNumber,
          pageSize,
        },
      })
    ),
};

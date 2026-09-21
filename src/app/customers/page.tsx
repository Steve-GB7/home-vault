"use client";

import { useState } from "react";
import { RoleSwitcherHeader } from "@/components/layout/RoleSwitcherHeader";
import { Sidebar } from "@/components/layout/Sidebar";
import { Badge } from "@/components/ui/badge";
import { CoverageCountdownBadge } from "@/components/household/CoverageCountdownBadge";
import { Users, Home, Phone, Mail, MapPin } from "lucide-react";
import { useRole } from "@/hooks/useRole";
import { DEMO_BUSINESS_ID } from "@/lib/constants";

export default function CustomersPage() {
  const { user } = useRole();
  const [customers] = useState([
    {
      id: "aaaaaaaa-0000-0000-0000-000000000001",
      name: "Nair Residence",
      contactPerson: "Priya Nair",
      phone: "+91-9847-112233",
      email: "priya@homevault.demo",
      address: "Flat 4B, Green Meadows, Pathanamthitta, Kerala - 689645",
      appliances: [
        {
          id: "dddddddd-0000-0000-0000-000000000001",
          brand: "LG",
          model: "PS-Q19YNZE",
          category: "air_conditioner",
          serial: "311KRPZ4D827",
          warrantyEndDate: "2033-04-17",
          amcEndDate: new Date(Date.now() + 41 * 86400000).toISOString().split("T")[0],
          serviceCount: 3,
        },
        {
          id: "dddddddd-0000-0000-0000-000000000002",
          brand: "Samsung",
          model: "RT34C4522S8",
          category: "refrigerator",
          serial: "SMSNRF2022X91",
          warrantyEndDate: "2032-11-01",
          amcEndDate: null,
          serviceCount: 1,
        },
        {
          id: "dddddddd-0000-0000-0000-000000000003",
          brand: "Kent",
          model: "Grand Plus",
          category: "ro_water_purifier",
          serial: "KNTGP8841",
          warrantyEndDate: "2025-06-09",
          amcEndDate: null,
          serviceCount: 0,
        },
      ],
    },
  ]);

  const isCoolCare = !user.businessId || user.businessId === DEMO_BUSINESS_ID;
  const displayCustomers = isCoolCare ? customers : [];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <RoleSwitcherHeader />

      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        <Sidebar />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6 min-w-0">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              Assigned Household Customers
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Service centers have access to appliance specs and repair histories with privacy shielding.
            </p>
          </div>

          <div className="space-y-6">
            {displayCustomers.length === 0 ? (
              <div className="bg-white rounded-lg border border-slate-200 p-12 text-center">
                <Users className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                <h2 className="text-sm font-semibold text-slate-800">No Assigned Customers Yet</h2>
                <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
                  Customer households will appear here once service requests or maintenance contracts are assigned to your service center.
                </p>
              </div>
            ) : (
              displayCustomers.map((cust) => (
                <div
                  key={cust.id}
                  className="bg-white rounded-lg border border-slate-200 p-6 space-y-5"
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center text-slate-700 shrink-0">
                        <Home className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h2 className="text-base font-semibold text-slate-900">{cust.name}</h2>
                          <Badge variant="success" size="sm">
                            Active AMC Client
                          </Badge>
                        </div>
                        <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-slate-400" />
                          <span>{cust.address}</span>
                        </p>
                        <div className="flex flex-wrap items-center gap-4 text-xs text-slate-600 mt-2">
                          <span className="inline-flex items-center gap-1">
                            <Phone className="w-3.5 h-3.5 text-slate-400" />
                            {cust.phone}
                          </span>
                          <span className="inline-flex items-center gap-1">
                            <Mail className="w-3.5 h-3.5 text-slate-400" />
                            {cust.email}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Customer Appliances Table */}
                  <div className="space-y-3 pt-3 border-t border-slate-100">
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                      Appliances under Service ({cust.appliances.length})
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {cust.appliances.map((app) => (
                        <div
                          key={app.id}
                          className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 text-xs space-y-2"
                        >
                          <div>
                            <span className="text-[10px] font-medium uppercase text-slate-400 block">
                              {app.category.replace("_", " ")}
                            </span>
                            <h4 className="font-semibold text-slate-900 text-sm">
                              {app.brand} {app.model}
                            </h4>
                          </div>

                          <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                            <CoverageCountdownBadge
                              label="Warranty"
                              endDate={app.warrantyEndDate}
                              size="sm"
                            />
                            {app.amcEndDate && (
                              <CoverageCountdownBadge
                                label="AMC"
                                endDate={app.amcEndDate}
                                size="sm"
                              />
                            )}
                          </div>

                          <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-slate-500">
                            <span>S/N: {app.serial}</span>
                            <span className="text-slate-700 font-medium">
                              {app.serviceCount} services
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

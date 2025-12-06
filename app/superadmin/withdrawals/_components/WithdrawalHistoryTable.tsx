"use client";

import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { IconInfoCircle } from "@tabler/icons-react";

type WithdrawalStatus = "Pending" | "Completed" | "Cancelled";

type Withdrawal = {
  id: string;
  method: string;
  methodDetails: string;
  requestedOn: string;
  amount: number;
  status: WithdrawalStatus;
};

const demoWithdrawals: Withdrawal[] = [
  {
    id: "1",
    method: "PayPal",
    methodDetails: "te****t@gmail.com",
    requestedOn: "March 5, 2023 6:09 pm",
    amount: 80,
    status: "Pending",
  },
  {
    id: "2",
    method: "PayPal",
    methodDetails: "te****t@gmail.com",
    requestedOn: "February 23, 2023 1:15 pm",
    amount: 120,
    status: "Pending",
  },
  {
    id: "3",
    method: "PayPal",
    methodDetails: "te****t@gmail.com",
    requestedOn: "February 23, 2023 1:07 pm",
    amount: 100,
    status: "Pending",
  },
];

export function WithdrawalHistoryTable() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        delay: 0.4,
        duration: 0.5,
        type: "spring",
        stiffness: 100,
        damping: 15,
      }}
    >
      <Card className="group relative overflow-hidden rounded-2xl border border-border/50 bg-gradient-to-br from-background/98 via-background/95 to-background transition-all duration-500 hover:border-primary/60 hover:bg-background">
        <CardHeader className="relative pb-4">
          <CardTitle className="text-2xl font-bold">Withdrawal History</CardTitle>
        </CardHeader>
        <CardContent className="relative p-0">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-border/50 bg-muted/30">
                  <th className="h-14 px-6 text-left font-semibold text-foreground">
                    Withdrawal Method
                  </th>
                  <th className="h-14 px-6 text-center font-semibold text-foreground">
                    Requested On
                  </th>
                  <th className="h-14 px-6 text-right font-semibold text-foreground">
                    Amount
                  </th>
                  <th className="h-14 px-6 text-right font-semibold text-foreground">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody>
                {demoWithdrawals.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="h-24 text-center text-muted-foreground">
                      No withdrawal requests found.
                    </td>
                  </tr>
                ) : (
                  demoWithdrawals.map((withdrawal, index) => (
                    <motion.tr
                      key={withdrawal.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{
                        delay: index * 0.05,
                        duration: 0.3,
                        type: "spring",
                        stiffness: 100,
                      }}
                      whileHover={{
                        backgroundColor: "rgba(var(--muted), 0.1)",
                      }}
                      className="border-b border-border/30 transition-colors"
                    >
                      <td className="h-20 px-6 align-middle">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-500/10 border border-blue-500/20">
                            <span className="text-xs font-bold text-blue-600 dark:text-blue-400">
                              PP
                            </span>
                          </div>
                          <div className="flex flex-col">
                            <p className="font-semibold leading-tight">{withdrawal.method}</p>
                            <p className="mt-0.5 text-sm text-muted-foreground">
                              {withdrawal.methodDetails}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="h-20 px-6 text-center align-middle text-muted-foreground">
                        {withdrawal.requestedOn}
                      </td>
                      <td className="h-20 px-6 text-right align-middle">
                        <span className="font-bold text-lg">${withdrawal.amount}</span>
                      </td>
                      <td className="h-20 px-6 text-right align-middle">
                        <div className="flex items-center justify-end gap-2">
                          <Badge
                            variant="outline"
                            className="gap-1.5 rounded-full border-amber-500/30 bg-amber-500/10 px-3 py-1.5 text-xs font-semibold text-amber-600 dark:text-amber-400"
                          >
                            <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                            {withdrawal.status}
                          </Badge>
                          <button className="rounded-full p-1 text-muted-foreground transition-colors hover:text-foreground">
                            <IconInfoCircle className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}


"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { IconWallet } from "@tabler/icons-react";
import { WithdrawalRequestModal } from "./WithdrawalRequestModal";

export function WithdrawalSection() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const currentBalance = 625;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{
        delay: 0.3,
        duration: 0.5,
        type: "spring",
        stiffness: 100,
        damping: 15,
      }}
      whileHover={{ y: -2 }}
    >
      <Card className="group relative overflow-hidden rounded-2xl border border-border/50 bg-gradient-to-br from-background/98 via-background/95 to-background transition-all duration-500 hover:border-pink-500/60 hover:bg-background">
        <div className="absolute inset-0 bg-gradient-to-br from-pink-500/10 via-transparent to-pink-500/5 opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
        <CardContent className="relative p-8">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-5">
              <motion.div
                className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-pink-500/20 to-pink-600/10 border border-pink-500/30 transition-all duration-500 group-hover:border-pink-500/50"
                whileHover={{
                  rotate: [0, -8, 8, -8, 0],
                  scale: 1.1,
                }}
                transition={{ duration: 0.6, ease: "easeInOut" }}
              >
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-pink-500/20 via-transparent to-pink-500/5 opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
                <IconWallet className="relative h-8 w-8 text-pink-600 dark:text-pink-400" />
              </motion.div>
              <div className="space-y-1">
                <motion.p
                  className="text-sm font-semibold uppercase tracking-wider text-muted-foreground/80"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4, duration: 0.4 }}
                >
                  Current Balance
                </motion.p>
                <motion.p
                  className="text-2xl font-bold tracking-tight"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{
                    delay: 0.5,
                    duration: 0.4,
                    type: "spring",
                  }}
                >
                  You have{" "}
                  <span className="bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
                    ${currentBalance}
                  </span>{" "}
                  ready to withdraw now
                </motion.p>
              </div>
            </div>
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{
                delay: 0.6,
                duration: 0.4,
                type: "spring",
              }}
            >
              <Button
                onClick={() => setIsModalOpen(true)}
                className="group/btn relative overflow-hidden rounded-xl bg-gradient-to-r from-purple-600 to-purple-700 px-8 py-6 text-base font-semibold text-white transition-all duration-300 hover:scale-105 hover:from-purple-700 hover:to-purple-800"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.98 }}
              >
                <span className="absolute inset-0 bg-gradient-to-r from-purple-400 to-purple-500 opacity-0 transition-opacity duration-300 group-hover/btn:opacity-100" />
                <span className="relative z-10 flex items-center gap-2">
                  <IconWallet className="h-5 w-5" />
                  Withdrawal Request
                </span>
              </Button>
            </motion.div>
          </div>
        </CardContent>
      </Card>

      <WithdrawalRequestModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        withdrawableBalance={currentBalance}
      />
    </motion.div>
  );
}


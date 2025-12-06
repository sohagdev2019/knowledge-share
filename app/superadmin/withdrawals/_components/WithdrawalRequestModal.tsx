"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { IconInfoCircle, IconChevronUp, IconChevronDown, IconCreditCard, IconWallet } from "@tabler/icons-react";

type PaymentMethod = "Stripe" | "bKash";

type WithdrawalRequestModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  withdrawableBalance: number;
};

const paymentMethods: { value: PaymentMethod; label: string; icon: typeof IconCreditCard }[] = [
  { value: "Stripe", label: "Stripe", icon: IconCreditCard },
  { value: "bKash", label: "bKash", icon: IconWallet },
];

export function WithdrawalRequestModal({
  open,
  onOpenChange,
  withdrawableBalance,
}: WithdrawalRequestModalProps) {
  const [amount, setAmount] = useState(0);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentMethod>("Stripe");
  const minWithdrawal = 80;

  // Reset amount when modal opens
  useEffect(() => {
    if (open) {
      setAmount(0);
    }
  }, [open]);

  const handleIncrement = () => {
    const newAmount = Math.min(amount + 1, withdrawableBalance);
    setAmount(Number(newAmount.toFixed(2)));
  };

  const handleDecrement = () => {
    const newAmount = Math.max(amount - 1, 0);
    setAmount(Number(newAmount.toFixed(2)));
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value.replace(/[^0-9.]/g, "");
    const value = parseFloat(inputValue) || 0;
    const clampedValue = Math.max(0, Math.min(value, withdrawableBalance));
    setAmount(Number(clampedValue.toFixed(2)));
  };

  const handleSubmit = () => {
    if (amount >= minWithdrawal && amount <= withdrawableBalance) {
      // Handle withdrawal submission here
      console.log("Withdrawal request:", { amount, paymentMethod: selectedPaymentMethod });
      onOpenChange(false);
    }
  };

  const isAmountValid = amount >= minWithdrawal && amount <= withdrawableBalance;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <AnimatePresence>
        {open && (
          <DialogContent className="max-w-lg border-border/50 bg-gradient-to-br from-background/98 via-background/95 to-background p-0">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ duration: 0.3, type: "spring", stiffness: 300, damping: 30 }}
              className="relative p-8"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/5 opacity-50" />
              
              <div className="relative space-y-6">
                <DialogHeader className="space-y-3 text-left">
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1, duration: 0.3 }}
                  >
                    <DialogTitle className="text-2xl font-bold text-foreground">
                      Withdrawal Request
                    </DialogTitle>
                  </motion.div>
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15, duration: 0.3 }}
                  >
                    <DialogDescription className="text-sm leading-relaxed text-muted-foreground">
                      Please check your transaction notification on your connected withdrawal method
                    </DialogDescription>
                  </motion.div>
                </DialogHeader>

                <div className="space-y-6">
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2, duration: 0.3 }}
                    className="grid grid-cols-2 gap-4"
                  >
                    <div className="space-y-2 rounded-xl border border-border/50 bg-background/50 p-4">
                      <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        Withdrawable Balance
                      </Label>
                      <p className="text-2xl font-bold text-foreground">${withdrawableBalance}</p>
                    </div>
                    <div className="space-y-3">
                      <Label className="text-xs font-semibold uppercase tracking-wider text-white">
                        Selected Payment Method
                      </Label>
                      <Select
                        value={selectedPaymentMethod}
                        onValueChange={(value) => setSelectedPaymentMethod(value as PaymentMethod)}
                      >
                        <SelectTrigger className="h-14 w-full rounded-lg border-none bg-muted/90 px-4 text-left shadow-none hover:bg-muted focus:ring-2 focus:ring-primary/50 data-[state=open]:bg-muted">
                          <div className="flex w-full items-center gap-3">
                            {(() => {
                              const method = paymentMethods.find((m) => m.value === selectedPaymentMethod);
                              const Icon = method?.icon || IconCreditCard;
                              return (
                                <>
                                  <Icon className="h-6 w-6 shrink-0 text-emerald-500" />
                                  <Icon className="h-5 w-5 shrink-0 text-white" />
                                  <span className="flex-1 text-xl font-bold text-white">
                                    {method?.label || selectedPaymentMethod}
                                  </span>
                                </>
                              );
                            })()}
                          </div>
                        </SelectTrigger>
                        <SelectContent className="bg-background">
                          {paymentMethods.map((method) => {
                            const Icon = method.icon;
                            return (
                              <SelectItem key={method.value} value={method.value}>
                                <div className="flex items-center gap-2">
                                  <Icon className="h-4 w-4" />
                                  {method.label}
                                </div>
                              </SelectItem>
                            );
                          })}
                        </SelectContent>
                      </Select>
                    </div>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.25, duration: 0.3 }}
                    className="space-y-3"
                  >
                    <Label htmlFor="amount" className="text-sm font-semibold text-foreground">
                      Amount
                    </Label>
                    <div className="relative">
                      <Input
                        id="amount"
                        type="text"
                        value={amount === 0 ? "" : `$ ${amount.toFixed(2)}`}
                        onChange={handleAmountChange}
                        placeholder="$ 0.00"
                        className="h-14 pr-16 text-lg font-semibold transition-all focus-visible:border-primary focus-visible:ring-primary/40"
                      />
                      <div className="absolute right-2 top-1/2 -translate-y-1/2 flex flex-col gap-0.5">
                        <motion.button
                          type="button"
                          onClick={handleIncrement}
                          disabled={amount >= withdrawableBalance}
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          className="flex h-6 w-7 items-center justify-center rounded-t border border-border/50 bg-muted/50 text-xs transition-all hover:bg-muted hover:border-primary/50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <IconChevronUp className="h-3 w-3" />
                        </motion.button>
                        <motion.button
                          type="button"
                          onClick={handleDecrement}
                          disabled={amount <= 0}
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          className="flex h-6 w-7 items-center justify-center rounded-b border border-border/50 border-t-0 bg-muted/50 text-xs transition-all hover:bg-muted hover:border-primary/50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <IconChevronDown className="h-3 w-3" />
                        </motion.button>
                      </div>
                    </div>
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.3, duration: 0.3 }}
                      className="flex items-start gap-2 text-xs text-muted-foreground"
                    >
                      <IconInfoCircle className="mt-0.5 h-4 w-4 shrink-0" />
                      <span>Minimum withdraw amount is ${minWithdrawal}</span>
                    </motion.div>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.35, duration: 0.3 }}
                    className="flex gap-3 pt-2"
                  >
                    <Button
                      onClick={handleSubmit}
                      disabled={!isAmountValid}
                      className="flex-1 rounded-xl bg-gradient-to-r from-purple-600 to-purple-700 px-6 py-6 text-base font-semibold text-white transition-all hover:scale-105 hover:from-purple-700 hover:to-purple-800 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                    >
                      Submit Request
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => onOpenChange(false)}
                      className="flex-1 rounded-xl border-red-500/50 bg-background px-6 py-6 text-base font-semibold text-red-600 transition-all hover:scale-105 hover:bg-red-50 hover:border-red-500 dark:hover:bg-red-950/20"
                    >
                      Cancel
                    </Button>
                  </motion.div>
                </div>
              </div>
            </motion.div>
          </DialogContent>
        )}
      </AnimatePresence>
    </Dialog>
  );
}


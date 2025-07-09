"use client";
import React, { useState } from "react";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "./ui/alert-dialog";
import { Button } from "./ui/button";
import { useRouter } from "next/navigation";

function ErrorAlert({
  message,
  onOpenChange,
}: {
  message: string;
  onOpenChange: (open: boolean) => void;
}) {
    const router = useRouter();

    const handleClose = () => {
        onOpenChange(false)
        router.push("/")
    }
  return (
    <AlertDialog open={true} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="text-red-500 text-lg font-bold tracking-wide">Error</AlertDialogTitle>
        </AlertDialogHeader>
        <AlertDialogDescription className="text-sm font-medium tracking-wide">{message}</AlertDialogDescription>
        <AlertDialogFooter>
          <Button onClick={() => handleClose()}>Cerrar</Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export default ErrorAlert;

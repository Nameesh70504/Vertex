'use client';

import { Bell } from "lucide-react";
import { Show, SignInButton, SignUpButton, UserButton } from "@clerk/nextjs";
import { Suspense } from "react";
import { Button } from "@/components/ui/button";

export function AuthControls() {
  return (
    <Suspense
      fallback={
        <div className="flex h-10 items-center gap-3">
          <div className="h-9 w-20 animate-pulse rounded-md bg-neutral-100" />
          <div className="h-9 w-20 animate-pulse rounded-md bg-neutral-100" />
        </div>
      }
    >
      <Show when="signed-out">
        <div className="flex items-center gap-3">
          <SignInButton mode="modal">
            <Button variant="tertiary" size="md">
              Sign In
            </Button>
          </SignInButton>
          <SignUpButton mode="modal">
            <Button variant="primary" size="md">
              Sign Up
            </Button>
          </SignUpButton>
        </div>
      </Show>
      <Show when="signed-in">
        <div className="flex items-center gap-5">
          <button
            type="button"
            aria-label="Notifications"
            className="cursor-pointer text-neutral-900 transition-colors hover:text-primary-500"
          >
            <Bell className="h-6 w-6" aria-hidden="true" />
          </button>
          <UserButton
            appearance={{
              elements: {
                avatarBox: "h-10 w-10",
              },
            }}
          />
        </div>
      </Show>
    </Suspense>
  );
}

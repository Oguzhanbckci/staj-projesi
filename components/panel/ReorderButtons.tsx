"use client";

import { useActionState } from "react";
import { ArrowDown, ArrowUp } from "lucide-react";
import { SubmitButton } from "@/components/ui/SubmitButton";

export interface MoveActionState {
  success: boolean;
  formError?: string;
}

const initialState: MoveActionState = { success: true };

export interface ReorderButtonsProps {
  id: string;
  title: string;
  isFirst: boolean;
  isLast: boolean;
  action: (
    id: string,
    direction: "up" | "down",
    prevState: MoveActionState,
    formData: FormData
  ) => Promise<MoveActionState>;
}

// Yukarı/aşağı taşıma — komşu kayıtla order_index takası (bkz.
// lib/supabase/panelQueries.ts swapOrderIndex). Sürükle-bırak DEĞİL
// (KISITLAR: "şart değil, basit ve güvenilir olsun"). İlk kayıtta yukarı,
// son kayıtta aşağı butonu `disabled` — sınırda olduğunu görsel olarak
// anlatır, tıklanamaz.
export function ReorderButtons({ id, title, isFirst, isLast, action }: ReorderButtonsProps) {
  const upAction = action.bind(null, id, "up");
  const downAction = action.bind(null, id, "down");
  const [upState, upFormAction] = useActionState(upAction, initialState);
  const [downState, downFormAction] = useActionState(downAction, initialState);

  const error =
    (!upState.success && upState.formError) || (!downState.success && downState.formError);

  return (
    <div className="flex items-center gap-1">
      <form action={upFormAction}>
        <SubmitButton
          pendingLabel=""
          variant="ghost"
          size="sm"
          disabled={isFirst}
          aria-label={`"${title}" yukarı taşı`}
          className="px-1.5"
        >
          <ArrowUp className="h-4 w-4" aria-hidden="true" />
        </SubmitButton>
      </form>
      <form action={downFormAction}>
        <SubmitButton
          pendingLabel=""
          variant="ghost"
          size="sm"
          disabled={isLast}
          aria-label={`"${title}" aşağı taşı`}
          className="px-1.5"
        >
          <ArrowDown className="h-4 w-4" aria-hidden="true" />
        </SubmitButton>
      </form>
      {error && (
        <p role="alert" className="text-caption text-error">
          {error}
        </p>
      )}
    </div>
  );
}

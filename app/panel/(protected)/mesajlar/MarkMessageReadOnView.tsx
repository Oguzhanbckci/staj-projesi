"use client";

import { useActionState, useEffect, useRef } from "react";
import { markMessageReadAction, type MarkReadState } from "./actions";

const initialState: MarkReadState = { success: true };

// Hiçbir UI render etmeyen, görünmez bir bileşen — mesaj detay sayfası
// açıldığında OTOMATİK okundu işaretler (KISITLAR: "mesajı açınca...
// okundu olarak işaretle") — kullanıcı hiçbir şeye tıklamıyor.
// `hasTriggeredRef` React'in Strict Mode'da (dev) effect'i bilerek çift
// çalıştırmasına karşı — ikinci çalışmada tekrar tetiklenmesin diye
// (ref, sahte unmount/remount döngüsünde de kalıcı, `useState`'in
// aksine).
export function MarkMessageReadOnView({
  messageId,
  alreadyRead,
}: {
  messageId: string;
  alreadyRead: boolean;
}) {
  const [, formAction] = useActionState(
    markMessageReadAction.bind(null, messageId),
    initialState
  );
  const hasTriggeredRef = useRef(false);

  useEffect(() => {
    if (alreadyRead || hasTriggeredRef.current) return;
    hasTriggeredRef.current = true;
    formAction(new FormData());
  }, [alreadyRead, formAction]);

  return null;
}

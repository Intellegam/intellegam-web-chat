function BackendAction({ action }: { action: string }) {
  return (
    <div className="text-center ml-10 text-sm text-gray-500 italic">
      {action}
    </div>
  );
}

export default function BackendActions({
  actions,
  messageId,
}: { actions: string[]; messageId: string }) {
  return (
    <>
      {actions.map((action, actionIndex) => (
        <BackendAction
          key={`action-${messageId}-${
            // biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
            actionIndex
          }`}
          action={action}
        />
      ))}
    </>
  );
}

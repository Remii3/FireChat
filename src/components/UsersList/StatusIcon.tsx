function StatusIcon({ isOnline }: { isOnline: boolean }) {
  return (
    <>
      {isOnline ? (
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 bg-green-600 rounded-full"></div>
        </div>
      ) : (
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 bg-zinc-300 rounded-full"></div>
        </div>
      )}
    </>
  );
}

export default StatusIcon;

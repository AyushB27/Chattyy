import React from "react";
import Avatar from "../common/Avatar";
import { useSocket } from "../../context/SocketContext";

export default function MemberList({
  members = [],
  ownerId,
  onMemberClick,
}) {
  const { userStatuses } = useSocket();

  const onlineMembers = [];
  const offlineMembers = [];

  members.forEach((m) => {
    const u = m.userId;
    if (!u) return;

    const liveStatus = userStatuses[u._id] || u.status || "offline";
    const memberObj = {
      ...u,
      role: m.role || (u._id === ownerId ? "owner" : "member"),
      liveStatus,
    };

    if (liveStatus === "offline") {
      offlineMembers.push(memberObj);
    } else {
      onlineMembers.push(memberObj);
    }
  });

  return (
    <div
      className="w-60 flex flex-col h-full select-none flex-shrink-0 border-l p-3.5 overflow-y-auto no-scrollbar"
      style={{
        backgroundColor: "var(--bg-sidebar)",
        borderColor: "var(--border-subtle)",
      }}
    >
      {/* Online Section */}
      {onlineMembers.length > 0 && (
        <div className="mb-4">
          <div
            className="text-[11px] font-black uppercase tracking-wider px-2 mb-2"
            style={{ color: "var(--text-muted)" }}
          >
            Online — {onlineMembers.length}
          </div>
          <div className="space-y-1">
            {onlineMembers.map((member) => (
              <div
                key={member._id}
                onClick={() => onMemberClick(member, member.role)}
                className="flex items-center gap-3 px-2.5 py-2 rounded-xl hover:bg-white/5 transition cursor-pointer"
              >
                <Avatar
                  src={member.avatar}
                  name={member.username}
                  status={member.liveStatus}
                  size="sm"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span
                      className="text-sm font-semibold truncate"
                      style={{ color: "var(--text-primary)" }}
                    >
                      {member.username}
                    </span>
                    {member.role === "owner" && (
                      <span className="text-[11px] text-amber-400 font-bold" title="Server Owner">
                        👑
                      </span>
                    )}
                  </div>
                  {member.customStatus && (
                    <div
                      className="text-[11px] truncate font-medium"
                      style={{ color: "var(--text-muted)" }}
                    >
                      {member.customStatus}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Offline Section */}
      {offlineMembers.length > 0 && (
        <div>
          <div
            className="text-[11px] font-black uppercase tracking-wider px-2 mb-2"
            style={{ color: "var(--text-muted)" }}
          >
            Offline — {offlineMembers.length}
          </div>
          <div className="space-y-1 opacity-70">
            {offlineMembers.map((member) => (
              <div
                key={member._id}
                onClick={() => onMemberClick(member, member.role)}
                className="flex items-center gap-3 px-2.5 py-2 rounded-xl hover:bg-white/5 transition cursor-pointer"
              >
                <Avatar
                  src={member.avatar}
                  name={member.username}
                  status="offline"
                  size="sm"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span
                      className="text-sm font-semibold truncate"
                      style={{ color: "var(--text-secondary)" }}
                    >
                      {member.username}
                    </span>
                    {member.role === "owner" && (
                      <span className="text-[11px] text-amber-400/70 font-bold" title="Server Owner">
                        👑
                      </span>
                    )}
                  </div>
                  {member.customStatus && (
                    <div
                      className="text-[11px] truncate"
                      style={{ color: "var(--text-muted)" }}
                    >
                      {member.customStatus}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

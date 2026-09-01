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
    <aside
      aria-label="Server members"
      className="w-60 flex flex-col h-full select-none flex-shrink-0 border-l p-2 overflow-y-auto no-scrollbar"
      style={{
        backgroundColor: "var(--bg-sidebar)",
        borderColor: "var(--border-subtle)",
      }}
    >
      {/* Online Section */}
      {onlineMembers.length > 0 && (
        <div className="mb-4">
          <div className="text-[11px] font-bold uppercase tracking-wider text-[#949ba4] px-2 mb-1">
            Online — {onlineMembers.length}
          </div>
          <div className="space-y-0.5">
            {onlineMembers.map((member) => (
              <div
                key={member._id}
                onClick={() => onMemberClick(member, member.role)}
                className="flex items-center gap-3 px-2 py-1.5 rounded hover:bg-[#35373c] transition cursor-pointer group"
              >
                <Avatar
                  src={member.avatar}
                  name={member.username}
                  status={member.liveStatus}
                  size="sm"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm font-medium truncate text-[#949ba4] group-hover:text-[#dbdee1]">
                      {member.username}
                    </span>
                    {member.role === "owner" && (
                      <span className="text-[11px] text-[#fee75c]" title="Server Owner">
                        👑
                      </span>
                    )}
                  </div>
                  {member.customStatus && (
                    <div className="text-[11px] truncate text-[#949ba4]">
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
          <div className="text-[11px] font-bold uppercase tracking-wider text-[#949ba4] px-2 mb-1">
            Offline — {offlineMembers.length}
          </div>
          <div className="space-y-0.5 opacity-60">
            {offlineMembers.map((member) => (
              <div
                key={member._id}
                onClick={() => onMemberClick(member, member.role)}
                className="flex items-center gap-3 px-2 py-1.5 rounded hover:bg-[#35373c] transition cursor-pointer group"
              >
                <Avatar
                  src={member.avatar}
                  name={member.username}
                  status="offline"
                  size="sm"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm font-medium truncate text-[#949ba4] group-hover:text-[#dbdee1]">
                      {member.username}
                    </span>
                    {member.role === "owner" && (
                      <span className="text-[11px] text-[#fee75c]" title="Server Owner">
                        👑
                      </span>
                    )}
                  </div>
                  {member.customStatus && (
                    <div className="text-[11px] truncate text-[#949ba4]">
                      {member.customStatus}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </aside>
  );
}

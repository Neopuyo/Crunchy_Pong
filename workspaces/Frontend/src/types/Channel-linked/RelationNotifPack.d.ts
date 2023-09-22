import { RelationNotif } from "@/lib/enums/relationNotif.enum";
import { EditChannelRelation } from "@/types/Channel-linked/EditChannelRelation";

export type RelationNotifPack = {
    notif:RelationNotif,
    edit:EditChannelRelation | undefined,
}
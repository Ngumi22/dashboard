"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Entities from "@/components/Auth/components/entities";
import Actions from "@/components/Auth/components/actions";
import Userrs from "@/components/Auth/components/users";
import Permission from "@/components/Auth/components/permissions";

export default function ABACManagement() {
  return (
    <div className="container mx-auto py-10">
      <Tabs defaultValue="users">
        <TabsList>
          <TabsTrigger value="users">Users</TabsTrigger>

          <TabsTrigger value="entities">Entities</TabsTrigger>
          <TabsTrigger value="actions">Actions</TabsTrigger>
          <TabsTrigger value="permissions">Permissions</TabsTrigger>
        </TabsList>

        <TabsContent value="users">
          <Userrs />
        </TabsContent>

        <TabsContent value="entities">
          <Entities />
        </TabsContent>

        <TabsContent value="actions">
          <Actions />
        </TabsContent>

        <TabsContent value="permissions">
          <h2 className="text-2xl font-semibold mb-4">Permission Management</h2>
          <Permission />
        </TabsContent>
      </Tabs>
    </div>
  );
}

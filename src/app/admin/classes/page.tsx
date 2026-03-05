import React from "react";
import { getClassRooms } from "@/app/activities/actions";
import ClassesClient from "./ClassesClient";

export default async function AdminClassesPage() {
    const classes = await getClassRooms();

    return <ClassesClient initialClasses={classes} />;
}

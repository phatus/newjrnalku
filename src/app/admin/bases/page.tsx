import React from "react";
import { getImplementationBases } from "@/app/activities/actions";
import BasesClient from "./BasesClient";

export default async function AdminBasesPage() {
    const bases = await getImplementationBases();

    return <BasesClient initialBases={bases} />;
}

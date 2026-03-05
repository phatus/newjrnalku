import React from "react";
import { getCategories } from "@/app/activities/actions";
import CategoriesClient from "./CategoriesClient";

export default async function AdminCategoriesPage() {
    const categories = await getCategories();

    return <CategoriesClient initialCategories={categories} />;
}

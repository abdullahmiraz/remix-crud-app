import { ActionFunction, redirect, json } from "@remix-run/node";
import { Form, Link, useActionData } from "@remix-run/react";
import { Item } from "~/model/item.server";
import { connectDB } from "~/utils/db.server";

type ActionData = {
  error?: string;
  fieldErrors?: {
    name?: string;
    description?: string;
  };
  fields?: {
    name: string;
    description?: string;
  };
};

export const action: ActionFunction = async ({ request }) => {
  try {
    await connectDB();
    const form = await request.formData();
    const name = form.get("name");
    const description = form.get("description");

    const fieldErrors: ActionData["fieldErrors"] = {};
    if (typeof name !== "string" || name.trim().length === 0) {
      fieldErrors.name = "Name is required";
    }

    if (Object.keys(fieldErrors).length > 0) {
      return json<ActionData>({
        fieldErrors,
        fields: {
          name: typeof name === "string" ? name : "",
          description: typeof description === "string" ? description : "",
        },
      });
    }

    const newItem = new Item({ name, description });
    await newItem.save();
    return redirect(`/items/${newItem._id}`);
  } catch (error) {
    console.error("Error creating item:", error);
    return json<ActionData>(
      { error: "Failed to create item" },
      { status: 500 }
    );
  }
};

export default function NewItem() {
  const actionData = useActionData<ActionData>();

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Create New Item</h1>
        <Link to="/items" className="text-blue-600 hover:text-blue-800">
          ← Back to Items
        </Link>
      </div>

      {actionData?.error && (
        <div className="mb-4 p-4 bg-red-50 text-red-700 rounded-lg">
          {actionData.error}
        </div>
      )}

      <Form method="post" className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Name:
          </label>
          <input
            name="name"
            required
            defaultValue={actionData?.fields?.name}
            className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
              actionData?.fieldErrors?.name
                ? "border-red-300"
                : "border-gray-300"
            }`}
          />
          {actionData?.fieldErrors?.name && (
            <p className="mt-1 text-sm text-red-600">
              {actionData.fieldErrors.name}
            </p>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Description:
          </label>
          <textarea
            name="description"
            defaultValue={actionData?.fields?.description}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            rows={4}
          />
        </div>
        <button
          type="submit"
          className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg shadow hover:bg-blue-700 transition"
        >
          Create Item
        </button>
      </Form>
    </div>
  );
}

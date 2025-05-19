import {
  ActionFunction,
  LoaderFunction,
  json,
  redirect,
} from "@remix-run/node";
import { Link, useLoaderData, MetaFunction, Form } from "@remix-run/react";
import { Item } from "~/model/item.server";
import { connectDB } from "~/utils/db.server";

export const meta: MetaFunction<typeof loader> = ({ data }) => {
  if (!data?.item) {
    return [
      { title: "Item Not Found | Remix Items App" },
      { name: "description", content: "The requested item could not be found" },
    ];
  }

  return [
    { title: `${data.item.name} | Remix Items App` },
    {
      name: "description",
      content: data.item.description || "View item details",
    },
  ];
};

export const loader: LoaderFunction = async ({ params }) => {
  console.log("Detail route params:", params); // Debug log
  try {
    await connectDB();
    const item = await Item.findById(params.itemId);

    if (!item) {
      throw new Response("Item not found", { status: 404 });
    }

    return json({ item });
  } catch (error) {
    if (error instanceof Response) throw error;
    throw new Response("Error loading item", { status: 500 });
  }
};

export const action: ActionFunction = async ({ request, params }) => {
  if (request.method !== "DELETE") {
    throw new Response("Method not allowed", { status: 405 });
  }

  try {
    await connectDB();
    const item = await Item.findByIdAndDelete(params.itemId);

    if (!item) {
      throw new Response("Item not found", { status: 404 });
    }

    return redirect("/");
  } catch (error) {
    if (error instanceof Response) throw error;
    throw new Response("Error deleting item", { status: 500 });
  }
};

export default function ItemDetail() {
  const { item } = useLoaderData<typeof loader>();

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">{item.name}</h1>
        <div className="flex gap-4">
          <Link
            to={`/items/edit/${item._id}`}
            className="text-blue-600 hover:text-blue-800"
          >
            Edit
          </Link>
          <Form method="delete">
            <button
              type="submit"
              className="text-red-600 hover:text-red-800"
              onClick={(e) => {
                if (!confirm("Are you sure you want to delete this item?")) {
                  e.preventDefault();
                }
              }}
            >
              Delete
            </button>
          </Form>
          <Link to="/" className="text-blue-600 hover:text-blue-800">
            ← Back to Items
          </Link>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">
          Description
        </h2>
        <p className="text-gray-600 whitespace-pre-wrap">
          {item.description || "No description provided."}
        </p>
        <div className="mt-6 text-sm text-gray-500">
          <p>Created: {new Date(item.createdAt).toLocaleString()}</p>
          <p>Last updated: {new Date(item.updatedAt).toLocaleString()}</p>
        </div>
      </div>
    </div>
  );
}

import { LoaderFunction, json } from "@remix-run/node";
import { useLoaderData, Link, MetaFunction } from "@remix-run/react";
import { Item, IItem } from "~/model/item.server";
import { connectDB } from "~/utils/db.server";

export const meta: MetaFunction = () => {
  return [
    { title: "Items List | Remix Items App" },
    { name: "description", content: "View and manage your items" },
  ];
};

export const loader: LoaderFunction = async () => {
  await connectDB();
  const items = await Item.find();
  return json({ items });
};

export default function ItemList() {
  const { items } = useLoaderData<typeof loader>();

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">🗂️ Item List</h1>
        <Link
          to="/items/new"
          className="bg-blue-600 text-white px-4 py-2 rounded-lg shadow hover:bg-blue-700 transition"
        >
          + New Item
        </Link>
      </div>

      {items.length === 0 ? (
        <p className="text-gray-500 text-center">No items found.</p>
      ) : (
        <ul className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {items.map((item: any) => (
            <li key={item._id}>
              <Link
                to={`items/${item._id}`}
                className="block p-6 bg-white rounded-xl shadow-md hover:shadow-lg border border-gray-100 transition"
              >
                <h2 className="text-xl font-semibold text-gray-800">
                  {item.name}
                </h2>
                <p className="text-gray-500 line-clamp-2">
                  {item.description || "No description provided."}
                </p>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

import { Card } from "@/components/ui/card";
import prisma from "../lib/db";
import { unstable_noStore as noStore } from "next/cache";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Edit, File, Trash } from "lucide-react";
import supabase from "@/lib/supabaseClient";

async function getData() {
  noStore();
  try {
    const data = await prisma.post.findMany();
    return data;
  } catch (error) {
    throw new Error(`Error fetching posts: ${error}`);
  }
}

async function getImageFromStorage(picture: string) {
  if (!picture) {
    return "";
  }

  const { data } = await supabase.storage.from("uploads").getPublicUrl(picture);
  return data;
}

export default async function Posts() {
  const data = await getData();
  return (
    <>
      <div className="flex flex-col gap-y-4">
        {data?.map((item) => (
          <Card
            key={item.id}
            className="flex items-center justify-between my-2 p-4"
          >
            <div className="w-[700px]">
              <h2 className="font-semibold text-xl text-primary">
                {item.title}
              </h2>
              <p className="text-xs my-2">
                {new Intl.DateTimeFormat("en-US", {
                  dateStyle: "full",
                }).format(new Date(item.createdAt))}
              </p>
              <p className="text-justify my-3">{item.description}</p>
              <div className="mt-3">
                {getImageFromStorage(item.picture)
                  .then((url) => (
                    <img
                      src={url["publicUrl"]}
                      alt="images"
                      className="rounded-md w-full object-cover"
                    />
                  ))
                  .catch((e) => {
                    console.log(e);
                    return null;
                  })}
              </div>
            </div>
          </Card>
        ))}
      </div>
    </>
  );
}

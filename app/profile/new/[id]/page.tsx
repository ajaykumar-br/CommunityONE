import { SubmitButtons } from "@/app/components/SubmitButtons";
import prisma from "@/app/lib/db";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import supabase from "@/lib/supabaseClient";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { revalidatePath } from "next/cache";
import Link from "next/link";
import { redirect } from "next/navigation";

async function getData({ userId, postId }: { userId: string; postId: string }) {
  const data = await prisma.post.findUnique({
    where: {
      id: postId,
      userId: userId,
    },
    select: {
      title: true,
      description: true,
      id: true,
    },
  });

  return data;
}

export default async function DynamicRoute({
  params,
}: {
  params: { id: string };
}) {
  const { getUser } = getKindeServerSession();
  const user = await getUser();
  const data = await getData({ userId: user?.id as string, postId: params.id });

  async function postData(formData: FormData) {
    "use server";

    if (!user) throw new Error("you are not allowed");

    const title = formData.get("title") as string;
    const description = formData.get("description") as string;
    const picture = formData.get("picture") as File;

    console.log(picture);

    const { data: imageData, error } = await supabase.storage
      .from("uploads")
      .update("path/to/image.jpg", picture);

    if (error) {
      console.error("Error updating image:", error);
    } else {
      console.log("Image updated successfully:", imageData);
    }

    await prisma.post.update({
      where: {
        id: data?.id,
        userId: user.id,
      },
      data: {
        description: description,
        title: title,
        picture: URL.createObjectURL(picture),
      },
    });

    revalidatePath("/profile");
    return redirect("/profile");
  }

  return (
    <Card>
      <form action={postData}>
        <CardHeader>
          <CardTitle>Edit Post</CardTitle>
          <CardDescription>
            Right here you can now edit your posts
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-y-5">
          <div className="gap-y-2 flex flex-col">
            <Label>Title</Label>
            <Input
              required
              type="text"
              name="title"
              placeholder="Title for your post"
              defaultValue={data?.title}
            />
          </div>
          <div className="gap-y-2 flex flex-col">
            <Label htmlFor="picture">Picture</Label>
            <Input required name="picture" id="picture" type="file" />
          </div>
          <div className="flex flex-col gap-y-2">
            <Label>Description</Label>
            <Textarea
              name="description"
              placeholder="Describe your post as you want"
              defaultValue={data?.description}
              required
            />
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button asChild variant="destructive">
            <Link href="/profile">Cancel</Link>
          </Button>
          <SubmitButtons />
        </CardFooter>
      </form>
    </Card>
  );
}

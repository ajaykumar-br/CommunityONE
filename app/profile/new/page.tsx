import { SubmitButtons } from "@/app/components/SubmitButtons";
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
import Link from "next/link";
import prisma from "@/app/lib/db";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { redirect } from "next/navigation";
import supabase from "@/lib/supabaseClient";

export default async function NewPostRoute() {
  const { getUser } = getKindeServerSession();
  const user = await getUser();

  async function postData(formData: FormData) {
    "use server";

    if (!user) {
      throw new Error("Not Authorized");
    }

    const title = formData.get("title") as string;
    const description = formData.get("description") as string;
    const picture = formData.get("picture") as File;

    // console.log("Title:", title);
    // console.log("Description:", description);
    // console.log("Picture:", picture);

    // Upload the picture to Supabase storage
    const fileExtension = picture.name.split(".").pop();
    const filePath = `uploads/${Date.now()}.${fileExtension}`;
    // console.log("File path:", filePath);

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("uploads")
      .upload(filePath, picture as File);
    if (uploadError) {
      console.error("Error uploading image:", uploadError);
      throw new Error(`Error creating image: ${uploadError.message}`);
    }

    // Store the file path in the 'post' table
    await prisma.post.create({
      data: {
        userId: user?.id,
        title: title,
        description: description,
        picture: uploadData.path,
      },
    });

    return redirect("/profile");
  }

  return (
    <Card>
      <form action={postData}>
        <CardHeader>
          <CardTitle>New Post</CardTitle>
          <CardDescription>
            Right here you can now create your new posts
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

"use client";

import { useEffect, useState } from "react";
import { Button } from "./button";
import { Media } from "./course-structure";
import { TextInput } from "./input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";

const DialogDescription = ({ children }: { children: React.ReactNode }) => (
  <p className="text-sm text-gray-500">{children}</p>
);

const DialogFooter = ({ children }: { children: React.ReactNode }) => (
  <div className="flex justify-end space-x-2">{children}</div>
);

interface MediaDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (media: Omit<Media, "id">) => void;
  media?: Media | null;
}

export function MediaDialog({
  isOpen,
  onClose,
  onSave,
  media,
}: MediaDialogProps) {
  const [title, setTitle] = useState(media?.title || "");
  const [description, setDescription] = useState(media?.description || "");
  const [mediaType, setMediaType] = useState(media?.mediaType || "image");
  const [url, setUrl] = useState(media?.url || "");

  useEffect(() => {
    if (media) {
      setTitle(media.title);
      setDescription(media.description);
      setMediaType(media.mediaType);
      setUrl(media.url || "");
    } else {
      setTitle("");
      setDescription("");
      setMediaType("image");
      setUrl("");
    }
  }, [media]);

  const handleSave = () => {
    onSave({ title, description, mediaType, url });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{media ? "Edit Media" : "Add Media"}</DialogTitle>
          <DialogDescription>
            {media
              ? "Edit the details of your media."
              : "Add a new image or video to your lesson."}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <label>Title</label>
            <TextInput
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>
          <div>
            <label>Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full rounded-md border border-gray-300 p-2 text-sm"
            />
          </div>
          <div>
            <label>Type</label>
            <select
              value={mediaType}
              onChange={(e) => setMediaType(e.target.value)}
              className="w-full rounded-md border border-gray-300 p-2 text-sm"
            >
              <option value="image">Image</option>
              <option value="video">Video</option>
            </select>
          </div>
          <div>
            <label>URL</label>
            <TextInput value={url} onChange={(e) => setUrl(e.target.value)} />
          </div>
        </div>
        <DialogFooter>
          <Button onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave}>Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

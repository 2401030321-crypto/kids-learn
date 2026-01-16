import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { KidsCard } from "@/components/kids-card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Upload, Video, Check, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Content {
  id: number;
  title: string;
  description: string | null;
  type: string;
  thumbnailUrl: string;
  videoUrl: string | null;
  likes: number | null;
  isShort: boolean | null;
}

export default function CreatorDashboard() {
  const { user, getAuthHeader } = useAuth();
  const { toast } = useToast();
  const [myContent, setMyContent] = useState<Content[]>([]);
  const [loading, setLoading] = useState(false);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState<string>("creativity");
  const [thumbnailUrl, setThumbnailUrl] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [isShort, setIsShort] = useState(false);
  const [duration, setDuration] = useState<number>(0);

  useEffect(() => {
    fetchMyContent();
  }, []);

  const fetchMyContent = async () => {
    try {
      const response = await fetch("/api/content", {
        headers: getAuthHeader(),
      });
      const data = await response.json();
      setMyContent(data.filter((c: Content) => c.creatorId === user?.id));
    } catch (err) {
      console.error("Failed to fetch content:", err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch("/api/content", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeader(),
        },
        body: JSON.stringify({
          title,
          description,
          type,
          thumbnailUrl: thumbnailUrl || "https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=800&q=80",
          videoUrl,
          isShort,
          duration: isShort ? duration : null,
          creatorId: user?.id,
        }),
      });

      if (response.ok) {
        toast({
          title: "Video uploaded!",
          description: "Your video has been added successfully.",
        });
        setTitle("");
        setDescription("");
        setVideoUrl("");
        setThumbnailUrl("");
        setIsShort(false);
        setDuration(0);
        fetchMyContent();
      } else {
        throw new Error("Upload failed");
      }
    } catch (err) {
      toast({
        title: "Upload failed",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    }

    setLoading(false);
  };

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-8">
      <div className="text-center space-y-2">
        <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-red-500">
          Creator Dashboard
        </h1>
        <p className="text-muted-foreground">Upload videos for kids to enjoy!</p>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        <KidsCard className="p-6">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <Upload className="w-6 h-6" />
            Upload New Video
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="title">Video Title</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter video title"
                required
              />
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="What is this video about?"
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor="type">Category</Label>
              <Select value={type} onValueChange={setType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="creativity">Creativity</SelectItem>
                  <SelectItem value="learning">Learning</SelectItem>
                  <SelectItem value="story">Story</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="videoUrl">Video URL</Label>
              <Input
                id="videoUrl"
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
                placeholder="https://youtube.com/watch?v=..."
              />
            </div>

            <div>
              <Label htmlFor="thumbnailUrl">Thumbnail URL</Label>
              <Input
                id="thumbnailUrl"
                value={thumbnailUrl}
                onChange={(e) => setThumbnailUrl(e.target.value)}
                placeholder="https://example.com/thumbnail.jpg"
              />
            </div>

            <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
              <Switch
                id="isShort"
                checked={isShort}
                onCheckedChange={setIsShort}
              />
              <Label htmlFor="isShort">This is a Short (vertical video)</Label>
            </div>

            {isShort && (
              <div>
                <Label htmlFor="duration">Duration (seconds)</Label>
                <Input
                  id="duration"
                  type="number"
                  value={duration}
                  onChange={(e) => setDuration(Number(e.target.value))}
                  placeholder="60"
                  max={60}
                />
              </div>
            )}

            <Button type="submit" className="w-full" size="lg" disabled={loading}>
              {loading ? "Uploading..." : "Upload Video"}
            </Button>
          </form>
        </KidsCard>

        <div className="space-y-4">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Video className="w-6 h-6" />
            My Videos ({myContent.length})
          </h2>

          {myContent.length === 0 ? (
            <KidsCard className="p-8 text-center">
              <Video className="w-16 h-16 mx-auto text-gray-300 mb-4" />
              <p className="text-muted-foreground">No videos uploaded yet.</p>
              <p className="text-sm text-muted-foreground">Start by uploading your first video!</p>
            </KidsCard>
          ) : (
            <div className="space-y-4">
              {myContent.map((video) => (
                <KidsCard key={video.id} className="overflow-hidden">
                  <div className="flex gap-4">
                    <img
                      src={video.thumbnailUrl}
                      alt={video.title}
                      className="w-32 h-20 object-cover rounded-lg"
                    />
                    <div className="flex-1 py-2">
                      <h3 className="font-bold">{video.title}</h3>
                      <p className="text-sm text-muted-foreground line-clamp-1">
                        {video.description}
                      </p>
                      <div className="flex gap-2 mt-2">
                        <span className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded">
                          {video.type}
                        </span>
                        {video.isShort && (
                          <span className="text-xs bg-purple-100 text-purple-600 px-2 py-1 rounded">
                            Short
                          </span>
                        )}
                        <span className="text-xs text-muted-foreground">
                          ❤️ {video.likes || 0}
                        </span>
                      </div>
                    </div>
                  </div>
                </KidsCard>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

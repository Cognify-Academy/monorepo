const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:3333/api/v1";

class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

interface ApiResponse<T> {
  data?: T;
  error?: string;
}

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {},
    _silent = false,
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;

    const config: RequestInit = {
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
      credentials: "include",
      ...options,
    };

    const response = await fetch(url, config);

    if (!response.ok) {
      let errorMessage = "Request failed";
      try {
        const errorData = await response.json();
        errorMessage = errorData.error || errorMessage;
      } catch {
        errorMessage = response.statusText || errorMessage;
      }
      throw new ApiError(errorMessage, response.status);
    }

    const contentType = response.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
      return await response.json();
    } else {
      return (await response.text()) as unknown as T;
    }
  }

  async login(handle: string, password: string) {
    return this.makeRequest<{ token: string }>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ handle, password }),
    });
  }

  async signup(
    name: string,
    username: string,
    email: string,
    password: string,
  ) {
    return this.makeRequest<{ token: string }>("/auth/signup", {
      method: "POST",
      body: JSON.stringify({ name, username, email, password }),
    });
  }

  async refresh() {
    return this.makeRequest<{ token: string }>("/auth/refresh", {
      method: "POST",
    });
  }

  async logout() {
    return this.makeRequest<{ message: string }>("/auth/logout", {
      method: "POST",
    });
  }

  async getCourses() {
    return this.makeRequest<
      Array<{
        id: string;
        title: string;
        slug: string;
        description: string;
        published: boolean;
        createdAt: string;
        updatedAt: string;
        userId: string;
        instructors: Array<{ id: string }>;
        conceptIds: string[];
      }>
    >("/courses");
  }

  async getCourse(identifier: string, token?: string) {
    return this.makeAuthenticatedRequest<{
      id: string;
      title: string;
      slug: string;
      description: string;
      published: boolean;
      createdAt: string;
      updatedAt: string;
      userId: string;
      conceptIds: string[];
      sections: Array<{
        id: string;
        title: string;
        description: string;
        order: number;
        conceptIds: string[];
        lessons: Array<{
          id: string;
          title: string;
          description: string;
          content: string | null;
          order: number;
          conceptIds: string[];
          media: Array<{
            id: string;
            title: string;
            description: string;
            mediaType: string;
            content?: string;
            url?: string;
            notes?: string;
            transcript?: string;
            metadata?: Record<string, unknown>;
            createdAt: string;
            updatedAt: string;
          }>;
        }>;
      }>;
    }>(`/courses/${identifier}`, {}, token);
  }

  async enrollInCourse(identifier: string, token: string) {
    return this.makeAuthenticatedRequest<{ message: string }>(
      `/courses/${identifier}/students`,
      {
        method: "POST",
      },
      token,
    );
  }

  async createEnrollment(courseId: string, token: string) {
    return this.makeAuthenticatedRequest<{
      message: string;
      enrollment: Record<string, unknown>;
    }>(
      "/enrollments",
      {
        method: "POST",
        body: JSON.stringify({ courseId }),
      },
      token,
    );
  }

  async getStudentCourses(token: string) {
    return this.makeAuthenticatedRequest<
      Array<{
        id: string;
        title: string;
        slug: string;
        description: string;
        published: boolean;
        createdAt: string;
        updatedAt: string;
        userId: string;
        instructors: Array<{ id: string }>;
        conceptIds: string[];
        completed: boolean;
      }>
    >("/student/courses", {}, token);
  }

  // Authenticated requests
  async makeAuthenticatedRequest<T>(
    endpoint: string,
    options: RequestInit = {},
    token?: string,
  ): Promise<T> {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...(options.headers as Record<string, string>),
    };

    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    return this.makeRequest<T>(endpoint, {
      ...options,
      headers,
    });
  }

  async getConcepts() {
    return this.makeRequest<
      Array<{
        id: string;
        name: string;
        slug: string;
        description: string;
        importance: number;
        createdAt: string;
        updatedAt: string;
      }>
    >("/concepts");
  }

  // Instructor course methods
  async createCourse(
    data: {
      title: string;
      description: string;
      conceptIds: string[];
      published: boolean;
    },
    token: string,
  ) {
    return this.makeAuthenticatedRequest<{
      id: string;
      title: string;
      slug: string;
      description: string;
      conceptIds: string[];
      published: boolean;
      createdAt: string;
      updatedAt: string;
    }>(
      "/instructor/courses",
      {
        method: "POST",
        body: JSON.stringify(data),
      },
      token,
    );
  }

  async updateCourse(
    id: string,
    data: {
      title: string;
      description: string;
      conceptIds: string[];
      published: boolean;
    },
    token: string,
  ) {
    return this.makeAuthenticatedRequest<{
      id: string;
      title: string;
      slug: string;
      description: string;
      conceptIds: string[];
      published: boolean;
      createdAt: string;
      updatedAt: string;
    }>(
      `/instructor/courses/${id}`,
      {
        method: "PATCH",
        body: JSON.stringify(data),
      },
      token,
    );
  }

  async getInstructorCourse(id: string, token: string) {
    return this.makeAuthenticatedRequest<{
      id: string;
      title: string;
      slug: string;
      description: string;
      conceptIds: string[];
      published: boolean;
      sections: Array<{
        id: string;
        title: string;
        description: string;
        order: number;
        conceptIds: string[];
        lessons: Array<{
          id: string;
          title: string;
          description: string;
          content: string | null;
          order: number;
          conceptIds: string[];
          media: Array<{
            id: string;
            title: string;
            description: string;
            mediaType: string;
            content?: string;
            url?: string;
            notes?: string;
            transcript?: string;
            metadata?: Record<string, unknown>;
            createdAt: string;
            updatedAt: string;
          }>;
        }>;
      }>;
      createdAt: string;
      updatedAt: string;
    }>(`/instructor/courses/${id}`, {}, token);
  }

  async getInstructorCourses(token: string) {
    return this.makeAuthenticatedRequest<
      Array<{
        id: string;
        title: string;
        slug: string;
        description: string;
        published: boolean;
        createdAt: string;
        updatedAt: string;
        userId: string;
        instructors: Array<{ id: string }>;
        conceptIds: string[];
      }>
    >("/instructor/courses", {}, token);
  }

  // Section management methods
  async createSection(
    courseId: string,
    data: {
      title: string;
      description: string;
      conceptIds: string[];
    },
    token: string,
  ) {
    return this.makeAuthenticatedRequest<{
      id: string;
      title: string;
      description: string;
      order: number;
      conceptIds: string[];
    }>(
      `/instructor/courses/${courseId}/sections`,
      {
        method: "POST",
        body: JSON.stringify(data),
      },
      token,
    );
  }

  async updateSection(
    courseId: string,
    sectionId: string,
    data: {
      title: string;
      description: string;
      conceptIds: string[];
    },
    token: string,
  ) {
    return this.makeAuthenticatedRequest<{
      id: string;
      title: string;
      description: string;
      order: number;
      conceptIds: string[];
    }>(
      `/instructor/courses/${courseId}/sections/${sectionId}`,
      {
        method: "PATCH",
        body: JSON.stringify(data),
      },
      token,
    );
  }

  async deleteSection(courseId: string, sectionId: string, token: string) {
    return this.makeAuthenticatedRequest<{ message: string }>(
      `/instructor/courses/${courseId}/sections/${sectionId}`,
      {
        method: "DELETE",
      },
      token,
    );
  }

  async reorderSections(
    courseId: string,
    order: Array<{ id: string; order: number }>,
    token: string,
  ) {
    return this.makeAuthenticatedRequest<{ message: string }>(
      `/instructor/courses/${courseId}/sections/order`,
      {
        method: "PATCH",
        body: JSON.stringify({ order }),
      },
      token,
    );
  }

  // Lesson management methods
  async createLesson(
    courseId: string,
    sectionId: string,
    data: {
      title: string;
      description: string;
      content?: string | null;
      conceptIds: string[];
    },
    token: string,
  ) {
    return this.makeAuthenticatedRequest<{
      id: string;
      title: string;
      description: string;
      content: string | null;
      order: number;
      conceptIds: string[];
    }>(
      `/instructor/courses/${courseId}/sections/${sectionId}/lessons`,
      {
        method: "POST",
        body: JSON.stringify(data),
      },
      token,
    );
  }

  async updateLesson(
    courseId: string,
    sectionId: string,
    lessonId: string,
    data: {
      title: string;
      description: string;
      content?: string | null;
      conceptIds: string[];
    },
    token: string,
  ) {
    return this.makeAuthenticatedRequest<{
      id: string;
      title: string;
      description: string;
      content: string | null;
      order: number;
      conceptIds: string[];
    }>(
      `/instructor/courses/${courseId}/sections/${sectionId}/lessons/${lessonId}`,
      {
        method: "PATCH",
        body: JSON.stringify(data),
      },
      token,
    );
  }

  async deleteLesson(
    courseId: string,
    sectionId: string,
    lessonId: string,
    token: string,
  ) {
    return this.makeAuthenticatedRequest<{ message: string }>(
      `/instructor/courses/${courseId}/sections/${sectionId}/lessons/${lessonId}`,
      {
        method: "DELETE",
      },
      token,
    );
  }

  async reorderLessons(
    courseId: string,
    ordering: Array<{
      id: string;
      sectionId: string;
      order: number;
    }>,
    token: string,
  ) {
    return this.makeAuthenticatedRequest<{ message: string }>(
      `/instructor/courses/${courseId}/lessons/order`,
      {
        method: "PATCH",
        body: JSON.stringify({ ordering }),
      },
      token,
    );
  }

  // Media management methods
  async createMedia(
    data: {
      title: string;
      description: string;
      mediaType: string;
      lessonId: string;
      url: string;
    },
    token: string,
  ) {
    return this.makeAuthenticatedRequest<{
      id: string;
      title: string;
      description: string;
      mediaType: string;
      url: string;
      lessonId: string;
    }>(
      "/instructor/courses/media",
      {
        method: "POST",
        body: JSON.stringify(data),
      },
      token,
    );
  }

  async updateMedia(
    data: {
      title: string;
      description: string;
      mediaType: string;
      lessonId: string;
      mediaId: string;
      url: string;
    },
    token: string,
  ) {
    return this.makeAuthenticatedRequest<{
      id: string;
      title: string;
      description: string;
      mediaType: string;
      url: string;
      lessonId: string;
    }>(
      `/instructor/courses/media/${data.mediaId}`,
      {
        method: "PATCH",
        body: JSON.stringify(data),
      },
      token,
    );
  }

  async deleteMedia(mediaId: string, token: string) {
    return this.makeAuthenticatedRequest<{ message: string }>(
      `/instructor/courses/media/${mediaId}`,
      {
        method: "DELETE",
      },
      token,
    );
  }

  // Student lesson progress methods
  async recordLessonProgress(
    lessonId: string,
    completed: boolean,
    token: string,
  ) {
    return this.makeAuthenticatedRequest<{
      message: string;
      progress: {
        id: string;
        userId: string;
        lessonId: string;
        completed: boolean;
        completedAt?: string;
        createdAt: string;
        updatedAt: string;
      };
    }>(
      "/student/lessons/progress",
      {
        method: "POST",
        body: JSON.stringify({ lessonId, completed }),
      },
      token,
    );
  }

  async getLessonProgress(lessonId: string, token: string) {
    return this.makeAuthenticatedRequest<{
      progress: {
        id: string;
        userId: string;
        lessonId: string;
        completed: boolean;
        completedAt?: string;
        createdAt: string;
        updatedAt: string;
      } | null;
    }>(`/student/lessons/${lessonId}/progress`, {}, token);
  }

  async getConceptsFromCompletedLessons(token: string) {
    return this.makeAuthenticatedRequest<{
      concepts: Array<{
        id: string;
        name: string;
        slug: string;
        description: string;
        importance: number;
        createdAt: string;
        updatedAt: string;
        conceptSource: Array<{
          id: string;
          conceptSourceId: string;
          conceptTargetId: string;
          description: string;
          weighting?: number;
        }>;
        conceptTarget: Array<{
          id: string;
          conceptSourceId: string;
          conceptTargetId: string;
          description: string;
          weighting?: number;
        }>;
        completedLessons: Array<{
          lessonId: string;
          lessonTitle: string;
          completedAt?: string;
        }>;
      }>;
    }>("/student/concepts/completed", {}, token);
  }

  async getProfile(token: string) {
    return this.makeAuthenticatedRequest<{
      id?: string;
      email?: string;
      username?: string;
      name?: string;
      createdAt?: string;
      updatedAt?: string;
    }>("/student/profile", {}, token);
  }

  async getCertificates(token: string, userId: string) {
    return this.makeAuthenticatedRequest<{
      certificates: Array<{
        id: string;
        userId: string;
        courseId: string;
        studentDid: string;
        issuerDid: string;
        vcJson: any;
        vcHash: string;
        nftAddress: string | null;
        createdAt: any;
        course: {
          id: string;
          title: string;
          description: string;
        };
      }>;
    }>(`/certificates/student/${userId}`, {}, token);
  }
}

export const apiClient = new ApiClient();
export { ApiError };
export type { ApiResponse };

/**
 * postService.ts
 *
 * KEY FIX: All queries that combine where() + orderBy() have been changed to
 * use where() ONLY. Results are sorted client-side after fetching.
 * This avoids "The query requires an index" Firestore errors on new projects
 * that haven't manually created composite indexes in the Firebase console.
 */

import {
  collection,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  getDocs,
  orderBy,
  limit,
  serverTimestamp,
  Timestamp
} from 'firebase/firestore';
import { db } from '../firebase';

export interface Post {
  id: string;
  title: string;
  category: string;
  specializations?: string;
  location: string;
  specificCities?: string;
  travelDistance?: string;
  pricingModel?: string;
  description?: string;
  keywords?: string;
  checklist: string[];
  clientMaterials: string;
  timeFromHour: string;
  timeFromAmPm: string;
  timeToHour: string;
  timeToAmPm: string;
  availableDays: string[];
  startingPrice?: string;
  inspectionFee?: string;
  emergency: string;
  ownerName: string;
  ownerAddress?: string;
  nic?: string;
  mobile: string;
  email: string;
  images: string[];
  pdf?: string;
  status: 'pending' | 'approved' | 'rejected' | 'draft';
  serviceProviderId: string;
  createdAt: Date;
  updatedAt: Date;
  rejectionReason?: string;
}

const postsCollection = collection(db, 'posts');

/** Safely convert a Firestore Timestamp or raw value to a JS Date */
function toDate(value: any): Date {
  if (!value) return new Date();
  if (value instanceof Timestamp) return value.toDate();
  if (typeof value?.toDate === 'function') return value.toDate();
  if (value instanceof Date) return value;
  return new Date();
}

/** Convert a Firestore doc snapshot to a typed Post */
function docToPost(docSnap: any): Post {
  const data = docSnap.data();
  return {
    ...data,
    id: docSnap.id,
    createdAt: toDate(data.createdAt),
    updatedAt: toDate(data.updatedAt),
  } as Post;
}

/** Sort posts newest-first (client-side — no Firestore index needed) */
function sortNewest(posts: Post[]): Post[] {
  return posts.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
}

export const postService = {

  // ── CREATE ────────────────────────────────────────────────────────────────────

  async createPost(
    postData: Omit<Post, 'id' | 'createdAt' | 'updatedAt' | 'status' | 'rejectionReason'>
  ): Promise<string> {
    const postRef = doc(postsCollection);
    await setDoc(postRef, {
      ...postData,
      id: postRef.id,
      images: [],
      pdf: '',
      status: 'pending' as const,
      rejectionReason: '',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return postRef.id;
  },

  // ── READ ──────────────────────────────────────────────────────────────────────

  async getPost(id: string): Promise<Post | null> {
    const snap = await getDoc(doc(postsCollection, id));
    return snap.exists() ? docToPost(snap) : null;
  },

  /**
   * Fetch all posts for a provider.
   * NO orderBy — avoids composite index requirement. Sorted client-side.
   */
  async getPostsByServiceProvider(serviceProviderId: string): Promise<Post[]> {
    const snap = await getDocs(
      query(postsCollection, where('serviceProviderId', '==', serviceProviderId))
    );
    return sortNewest(snap.docs.map(docToPost));
  },

  /**
   * Fetch posts by status with optional pagination limit.
   * NO orderBy — sorted client-side.
   * @param limit - Number of posts to fetch (default 100 for initial load)
   */
  async getPostsByStatus(status: Post['status'], limitCount: number = 100): Promise<Post[]> {
    const snap = await getDocs(
      query(postsCollection, where('status', '==', status), limit(limitCount))
    );
    return sortNewest(snap.docs.map(docToPost));
  },

  /** Pending posts for admin queue */
  async getPendingPosts(): Promise<Post[]> {
    const snap = await getDocs(
      query(postsCollection, where('status', '==', 'pending'))
    );
    return sortNewest(snap.docs.map(docToPost));
  },

  /** Approved posts for public BrowsePlace — now with pagination support */
  async getApprovedPosts(limitCount: number = 100): Promise<Post[]> {
    const snap = await getDocs(
      query(postsCollection, where('status', '==', 'approved'), limit(limitCount))
    );
    return sortNewest(snap.docs.map(docToPost));
  },

  /**
   * Get ALL posts — uses orderBy alone (no where) so only a single-field
   * index is needed, which Firestore creates automatically.
   */
  async getAllPosts(limitCount?: number): Promise<Post[]> {
    let q = query(postsCollection, orderBy('createdAt', 'desc'));
    if (limitCount) q = query(q, limit(limitCount));
    const snap = await getDocs(q);
    return snap.docs.map(docToPost);
  },

  /** Client-side keyword search over approved posts */
  async searchPosts(keywords: string): Promise<Post[]> {
    const approved = await this.getApprovedPosts();
    const terms = keywords.toLowerCase().split(' ').filter(Boolean);
    return approved.filter((post) => {
      const haystack = [post.title, post.category, post.description,
        post.keywords, post.location, post.specificCities].join(' ').toLowerCase();
      return terms.every((t) => haystack.includes(t));
    });
  },

  /** Approved posts filtered by category (client-side) */
  async getPostsByCategory(category: string): Promise<Post[]> {
    const approved = await this.getApprovedPosts();
    return approved.filter(p => p.category === category);
  },

  // ── UPDATE ────────────────────────────────────────────────────────────────────

  async updatePost(id: string, updates: Partial<Post>): Promise<void> {
    await updateDoc(doc(postsCollection, id), {
      ...updates,
      updatedAt: serverTimestamp(),
    });
  },

  async approvePost(postId: string): Promise<void> {
    await updateDoc(doc(postsCollection, postId), {
      status: 'approved',
      rejectionReason: '',
      updatedAt: serverTimestamp(),
    });
  },

  async rejectPost(postId: string, reason: string): Promise<void> {
    await updateDoc(doc(postsCollection, postId), {
      status: 'rejected',
      rejectionReason: reason,
      updatedAt: serverTimestamp(),
    });
  },

  async updatePostAndResubmit(postId: string, updates: Partial<Post>): Promise<void> {
    await updateDoc(doc(postsCollection, postId), {
      ...updates,
      images: [],
      pdf: '',
      status: 'pending',
      rejectionReason: '',
      updatedAt: serverTimestamp(),
    });
  },

  // ── DELETE ────────────────────────────────────────────────────────────────────

  async deletePost(id: string): Promise<void> {
    await deleteDoc(doc(postsCollection, id));
  },
};
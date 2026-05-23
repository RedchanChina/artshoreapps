import { request, type PageResult } from './cloudbase'
import type {
  User,
  Address,
  CollectionItem,
  Coupon,
} from '@/types/user'

export async function login(code: string): Promise<{ token: string; userInfo: User }> {
  return request<{ token: string; userInfo: User }>('user-login', { code })
}

export async function getUserInfo(): Promise<User> {
  return request<User>('user-info', {})
}

export interface UpdateUserInfoData {
  nickname?: string
  avatar?: string
  phone?: string
  gender?: string
  bio?: string
}

export async function updateUserInfo(
  data: UpdateUserInfoData,
): Promise<User> {
  return request<User>('user-update', { data })
}

export async function getAddresses(): Promise<Address[]> {
  return request<Address[]>('user-addresses', {})
}

export async function addAddress(
  data: Omit<Address, 'id' | 'userId'>,
): Promise<Address> {
  return request<Address>('user-address-add', { data })
}

export async function updateAddress(
  id: string,
  data: Partial<Omit<Address, 'id' | 'userId'>>,
): Promise<Address> {
  return request<Address>('user-address-update', { id, data })
}

export async function deleteAddress(id: string): Promise<void> {
  return request<void>('user-address-delete', { id })
}

export interface CollectionListParams {
  page?: number
  pageSize?: number
  targetType?: string
}

export async function getCollections(
  params: CollectionListParams = {},
): Promise<PageResult<CollectionItem>> {
  return request<PageResult<CollectionItem>>('user-collections', { params })
}

export interface AddCollectionData {
  targetType: string
  targetId: string
}

export async function addCollection(
  data: AddCollectionData,
): Promise<CollectionItem> {
  return request<CollectionItem>('user-collection-add', { data })
}

export async function removeCollection(id: string): Promise<void> {
  return request<void>('user-collection-remove', { id })
}

export async function getCoupons(): Promise<Coupon[]> {
  return request<Coupon[]>('user-coupons', {})
}

A, B, C = map(int, input().split())

nums = [A, B, C]
nums.sort()          # 오름차순 정렬 -> [작은수, 가운데수, 큰수]
print(nums[1])       # 두 번째로 큰 수(가운데 값)
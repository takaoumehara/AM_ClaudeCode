'use client';

import Link from 'next/link';
import { ProfileListItem } from '@/lib/firebase/profiles';
import { Text, styled } from '@tamagui/core';
import { XStack, YStack } from '@tamagui/stacks';
import { Card } from '@tamagui/card';
import { Button } from '@tamagui/button';
import { Avatar } from '@tamagui/avatar';
import { User, MapPin, Users, Zap } from 'lucide-react';

export type SortField = 'name' | 'title' | 'skillCount' | 'teamCount';
export type SortDirection = 'asc' | 'desc';

interface ProfileGridProps {
  profiles: ProfileListItem[];
  loading?: boolean;
  onSort?: (field: SortField, direction: SortDirection) => void;
  sortField?: SortField;
  sortDirection?: SortDirection;
}

export const ProfileGrid: React.FC<ProfileGridProps> = ({
  profiles,
  loading = false,
  onSort,
  sortField,
  sortDirection
}) => {

  if (loading) {
    return (
      <YStack space="$4" padding="$4">
        {Array.from({ length: 6 }).map((_, index) => (
          <Card key={index} elevate size="$4">
            <Card.Header>
              <XStack space="$3" alignItems="center">
                <Avatar circular size="$6">
                  <Avatar.Fallback backgroundColor="$gray5" />
                </Avatar>
                <YStack flex={1}>
                  <Text fontSize="$5" fontWeight="600" color="$gray8">Loading...</Text>
                  <Text fontSize="$3" color="$gray6">Loading title...</Text>
                </YStack>
              </XStack>
            </Card.Header>
          </Card>
        ))}
      </YStack>
    );
  }

  if (profiles.length === 0) {
    return (
      <Card elevate size="$6" margin="$4">
        <Card.Header>
          <YStack alignItems="center" space="$4">
            <Avatar circular size="$8" backgroundColor="$gray3">
              <Avatar.Fallback>
                <User size={32} color="$gray8" />
              </Avatar.Fallback>
            </Avatar>
            <YStack alignItems="center" space="$2">
              <Text fontSize="$6" fontWeight="600" color="$gray11">
                No profiles to display
              </Text>
              <Text fontSize="$4" color="$gray8" textAlign="center">
                No profiles match your current filters or search criteria.
              </Text>
            </YStack>
          </YStack>
        </Card.Header>
      </Card>
    );
  }

  return (
    <YStack space="$4" padding="$4">
      {profiles.map(({ id, profile }) => (
        <Card key={id} elevate size="$4" hoverStyle={{ scale: 1.02 }}>
          <Card.Header>
            <XStack space="$4" alignItems="center">
              {/* Profile Avatar */}
              <Avatar circular size="$6">
                {profile?.core?.photoUrl ? (
                  <Avatar.Image
                    source={{ uri: profile.core?.photoUrl }}
                    alt={profile?.core?.name || 'Profile'}
                  />
                ) : (
                  <Avatar.Fallback backgroundColor="$blue4">
                    <User size={24} color="$blue10" />
                  </Avatar.Fallback>
                )}
              </Avatar>

              {/* Profile Info */}
              <YStack flex={1} space="$2">
                <XStack justifyContent="space-between" alignItems="center">
                  <Text fontSize="$5" fontWeight="600" color="$gray12">
                    {profile?.core?.name || 'Unknown'}
                  </Text>
                  <Link href={`/profiles/${id}`}>
                    <Button size="$3" variant="outlined">
                      View
                    </Button>
                  </Link>
                </XStack>

                {profile?.core?.mainTitle && (
                  <XStack space="$2" alignItems="center">
                    <MapPin size={14} color="$gray8" />
                    <Text fontSize="$3" color="$gray10">
                      {profile.core?.mainTitle}
                    </Text>
                  </XStack>
                )}

                {/* Skills */}
                {profile?.core?.mainSkills && profile.core?.mainSkills.length > 0 && (
                  <XStack space="$2" alignItems="center" flexWrap="wrap">
                    <Zap size={14} color="$blue10" />
                    <XStack space="$2" flexWrap="wrap">
                      {profile.core?.mainSkills.slice(0, 3).map((skill, index) => (
                        <Text
                          key={`${skill}-${index}`}
                          fontSize="$2"
                          paddingHorizontal="$2"
                          paddingVertical="$1"
                          backgroundColor="$blue2"
                          color="$blue11"
                          borderRadius="$3"
                          borderWidth={1}
                          borderColor="$blue5"
                        >
                          {skill}
                        </Text>
                      ))}
                      {profile.core?.mainSkills.length > 3 && (
                        <Text
                          fontSize="$2"
                          paddingHorizontal="$2"
                          paddingVertical="$1"
                          backgroundColor="$gray3"
                          color="$gray10"
                          borderRadius="$3"
                        >
                          +{profile.core?.mainSkills.length - 3}
                        </Text>
                      )}
                    </XStack>
                  </XStack>
                )}

                {/* Teams */}
                {profile?.core?.teamIds && profile.core?.teamIds.length > 0 && (
                  <XStack space="$2" alignItems="center">
                    <Users size={14} color="$green10" />
                    <Text
                      fontSize="$2"
                      paddingHorizontal="$2"
                      paddingVertical="$1"
                      backgroundColor="$green2"
                      color="$green11"
                      borderRadius="$3"
                      borderWidth={1}
                      borderColor="$green5"
                    >
                      {profile.core?.teamIds.length} team{profile.core?.teamIds.length !== 1 ? 's' : ''}
                    </Text>
                  </XStack>
                )}
              </YStack>
            </XStack>
          </Card.Header>
        </Card>
      ))}
    </YStack>
  );
};
import React, { useEffect, useState } from 'react'
import { PrismaClient } from '@prisma/client'
import { GetStaticProps, GetStaticPaths } from 'next'
import { useSession } from 'next-auth/client'
import useShortcuts, { keyMap } from '~hooks/useShortcuts'
import { HotKeys } from 'react-hotkeys'
import { Global } from '@emotion/core'
import Metadata from '~components/Metadata'
import Header from '~components/Header'
import { DndProvider } from 'react-dnd'
import { Flex, Box, Spinner, Link } from '@chakra-ui/core'
import EditorErrorBoundary from '~components/errorBoundaries/EditorErrorBoundary'
import Editor from '~components/editor/Editor'
import Backend from 'react-dnd-html5-backend'
import useDispatch from '~hooks/useDispatch'

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const prisma = new PrismaClient()
  let projectId = (params!.slug as string).split('-')[0]

  const project = await prisma.project.findOne({
    include: { user: true },
    where: {
      id: Number(projectId),
    },
  })

  let projects = JSON.parse(JSON.stringify(project))

  return {
    props: {
      projects,
    },
  }
}

export const getStaticPaths: GetStaticPaths = async () => {
  const prisma = new PrismaClient()
  const projects = await prisma.project.findMany({
    where: {
      public: true,
    },
  })
  return {
    paths: projects.map(project => ({
      params: {
        slug: `${project.id.toString()}-${project.projectName.toString()}`,
      },
    })),
    fallback: true,
  }
}

interface User {
  id: number
  name: string | null
  email: string | null
  emailVerified: Date | null
  image: string | null
  createdAt: Date
  updatedAt: Date
}

interface Project {
  id: number
  createdAt: Date
  updatedAt: Date
  markup: string
  userId: number
  projectName: string
  public: boolean
  validated: boolean
  user: User
}

interface ProjectContainer {
  projects: Project
}

const ProjectPublic = (props: ProjectContainer) => {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(true)

  const { handlers } = useShortcuts()
  const [session] = useSession()
  const dispatch = useDispatch()

  const initProject = async () => {
    setLoading(true)
    if (props.projects) {
      if (props.projects.markup) {
        setError(true)
        await dispatch.components.reset(JSON.parse(props.projects.markup))
        setLoading(false)
      } else {
        setError(false)
        setLoading(false)
      }
    }
  }

  useEffect(() => {
    initProject()
    // eslint-disable-next-line
  }, [])

  return (
    <HotKeys allowChanges handlers={handlers} keyMap={keyMap}>
      <Global
        styles={() => ({
          html: { minWidth: '860px', backgroundColor: '#1a202c' },
        })}
      />

      <Metadata />

      <Header session={session} projectPage={true} />

      <DndProvider backend={Backend}>
        <Flex h="calc(100vh - 3rem)">
          {error ? (
            loading ? (
              <Spinner m="0 auto" color="white" size="xl" mt="3rem" />
            ) : (
              <EditorErrorBoundary>
                <Box bg="white" flex={1} zIndex={10} position="relative">
                  <Editor />
                </Box>
              </EditorErrorBoundary>
            )
          ) : (
            <Box color="white" m="0 auto">
              <Link href="/" color="teal.100">
                An error has occurred, click to return
              </Link>
            </Box>
          )}
        </Flex>
      </DndProvider>
    </HotKeys>
  )
}

export default ProjectPublic
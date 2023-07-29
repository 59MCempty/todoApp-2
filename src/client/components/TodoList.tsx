import { useState, type SVGProps, useRef } from 'react'

import * as Checkbox from '@radix-ui/react-checkbox'

import { useAutoAnimate } from '@formkit/auto-animate/react'
import { api } from '@/utils/client/api'
import { log } from 'console'
import { check } from 'prettier'



export const TodoList = () => {

  const { data: todos = [] } = api.todo.getAll.useQuery({
    statuses: ['completed', 'pending'],
  })


  const [currentId, setCurrentId] = useState<number>(0);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [parent] = useAutoAnimate();


  const listStatuses = ['all', 'pending', 'completed'];

  const clickStatusTodo = (e: React.MouseEvent<HTMLButtonElement>, status: string, id: number) => {
    setStatusFilter(status);
    setCurrentId(Number(e.currentTarget.id))
  }


  const filteredTodos = statusFilter === 'all' ? todos : todos.filter(todo => todo.status === statusFilter);

  const apiContext = api.useContext();

  // update status
  const { mutate: updateStatus, isLoading: isUpdatingStatus } =
    api.todoStatus.update.useMutation({
      onSuccess: () => {
        apiContext.todo.getAll.refetch();
      }
    })

  // delete todo  
  const { mutate: deleteTodo, isLoading: isDeletingTodo } =
    api.todo.delete.useMutation({
      onSuccess: () => {
        apiContext.todo.getAll.refetch();
      }
    });

  return (
    <>
      <div className='flex gap-2'>
        {listStatuses.map((s, id) =>
          <button
            key={id}
            id={String(id)}
            onClick={(e) => clickStatusTodo(e, s, id)}
            className={`border capitalize border-gray-200 rounded-full py-3 px-6 font-bold text-sm hover:text-white delay-200 transition duration-300 ease-out hover:bg-gray-600 ${currentId === id ? "bg-gray-700 text-white" : "bg-white text-gray-700"}`}>
            {s}
          </button>
        )}
      </div>

      <ul
        ref={parent}
        className="grid grid-cols-1 gap-y-3 pt-10 ">
        {filteredTodos.map((todo) => (
          <li key={todo.id}>
            <div className="rounded-12 border border-gray-200 px-4 py-3 shadow-sm flex items-center justify-between">
              <div className='flex items-center '>
                <Checkbox.Root
                  disabled={isUpdatingStatus}
                  checked={todo.status === 'pending' ? false : true}

                  // change status todo pending to complete and opposite
                  onCheckedChange={() => updateStatus({
                    todoId: todo.id,
                    status: todo.status === 'pending' ? "completed" : 'pending'
                  })}

                  id={String(todo.id)}
                  className="flex h-6 w-6 items-center justify-center rounded-6 border border-gray-300 focus:border-gray-700 focus:outline-none data-[state=checked]:border-gray-700 data-[state=checked]:bg-gray-700"
                >
                  <Checkbox.Indicator>
                    <CheckIcon className="h-4 w-4 text-white" />
                  </Checkbox.Indicator>
                </Checkbox.Root>

                <label className={`block pl-3 text-base font-medium ${todo.status === 'completed' ? "line-through cursor-pointer capitalize text-gray-500" : ""}`} htmlFor={String(todo.id)}>
                  {todo.body}
                </label>
              </div>

              {/* button delete */}
              <div className="w-6 h-6 cursor-pointer"
                onClick={() => deleteTodo({
                  id: todo.id
                })}
              >
                <XMarkIcon />
              </div>

            </div>
          </li>
        ))}
      </ul>
    </>
  )
}

const XMarkIcon = (props: SVGProps<SVGSVGElement>) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
      {...props}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M6 18L18 6M6 6l12 12"
      />
    </svg>
  )
}

const CheckIcon = (props: SVGProps<SVGSVGElement>) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
      {...props}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M4.5 12.75l6 6 9-13.5"
      />
    </svg>
  )
}

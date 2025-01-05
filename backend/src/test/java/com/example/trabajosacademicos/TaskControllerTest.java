package com.example.trabajosacademicos;

import com.example.trabajosacademicos.dtos.JobDTO;
import com.example.trabajosacademicos.dtos.TaskDTO;
import com.example.trabajosacademicos.dtos.TaskStatusDTO;
import com.example.trabajosacademicos.dtos.UserDTO;
import com.example.trabajosacademicos.entities.Objective;
import com.example.trabajosacademicos.requests.MoveStateRequest;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDate;
import java.time.LocalDateTime;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@TestMethodOrder(MethodOrderer.OrderAnnotation.class)
public class TaskControllerTest {

	@Autowired
	private MockMvc mockMvc;

	@Autowired
	private ObjectMapper objectMapper;

	private UserDTO userDTO;

	private UserDTO user2DTO;

	private TaskDTO taskDTO;

	private TaskDTO task2DTO;

	private TaskDTO task3DTO;

	private JobDTO jobDTO;

	private TaskStatusDTO taskStatusDTO;

	private TaskStatusDTO taskStatus2DTO;

	private MoveStateRequest moveStateRequest;

	@BeforeEach
	public void setup() throws Exception {
		userDTO = new UserDTO();
		userDTO.setId(1L);
		userDTO.setFirstName("John");
		userDTO.setLastName("Doe");
		userDTO.setEmail("prueba@gmail.com");
		userDTO.setRole("TEACHER");
		userDTO.setPassword("Password@123");
		userDTO.setPlace("New York");
		userDTO.setBirthdate(LocalDate.of(1990, 1, 1));
		userDTO.setPhoneNumber(681567567);

		user2DTO = new UserDTO();
		user2DTO.setId(2L);
		user2DTO.setFirstName("John");
		user2DTO.setLastName("Doe");
		user2DTO.setEmail("john@gmail.com");
		user2DTO.setRole("TEACHER");
		user2DTO.setPassword("Password@123");
		user2DTO.setPlace("New York");
		user2DTO.setBirthdate(LocalDate.of(1990, 1, 1));
		user2DTO.setPhoneNumber(681567567);

		mockMvc.perform(post("/api/users")
				.contentType(MediaType.APPLICATION_JSON)
				.content(objectMapper.writeValueAsString(userDTO)));

		mockMvc.perform(post("/api/users")
				.contentType(MediaType.APPLICATION_JSON)
				.content(objectMapper.writeValueAsString(user2DTO)));

		taskDTO = new TaskDTO();
		taskDTO.setId(1L);
		taskDTO.setName("Task Name");
		taskDTO.setSubject("Subject");
		taskDTO.setDeadlineDateTime(LocalDateTime.now().plusDays(1));
		taskDTO.setAssociatedAcademicWork("Job2");
		taskDTO.setTaskStatus(1L);
		taskDTO.setAssignedTo(new String[]{"prueba@gmail.com"});
		taskDTO.setDifficultyLevel("EASY");
		taskDTO.setPercentage(0);
		taskDTO.setObjectivesList(new Objective[]{});

		task2DTO = new TaskDTO();
		task2DTO.setId(2L);
		task2DTO.setName("Task Name");
		task2DTO.setSubject("Subject");
		task2DTO.setDeadlineDateTime(LocalDateTime.now().plusDays(1));
		task2DTO.setAssociatedAcademicWork("Job2");
		task2DTO.setTaskStatus(2L);
		task2DTO.setAssignedTo(new String[]{"prueba@gmail.com"});
		task2DTO.setDifficultyLevel("EASY");
		task2DTO.setPercentage(0);
		task2DTO.setObjectivesList(new Objective[]{});

		task3DTO = new TaskDTO();
		task3DTO.setId(3L);
		task3DTO.setName("Task Name");
		task3DTO.setSubject("Subject");
		task3DTO.setDeadlineDateTime(LocalDateTime.now().plusDays(1));
		task3DTO.setAssociatedAcademicWork("Job2");
		task3DTO.setTaskStatus(1L);
		task3DTO.setAssignedTo(new String[]{"prueba@gmail.com"});
		task3DTO.setDifficultyLevel("EASY");
		task3DTO.setPercentage(0);
		task3DTO.setObjectivesList(new Objective[]{});

		jobDTO = new JobDTO();
		jobDTO.setCreator("prueba@gmail.com");
		jobDTO.setTitle("Job2");
		jobDTO.setDescription("Job2 Description");
		jobDTO.setRelatedSubject("Math");
		jobDTO.setDeadlineDateTime(LocalDateTime.now().plusDays(1));

		taskStatusDTO = new TaskStatusDTO();
		taskStatusDTO.setId(1L);
		taskStatusDTO.setStatus("COMPLETED");
		taskStatusDTO.setEmail("prueba@gmail.com");

		taskStatus2DTO = new TaskStatusDTO();
		taskStatus2DTO.setId(2L);
		taskStatus2DTO.setStatus("FINISHED");
		taskStatus2DTO.setEmail("prueba@gmail.com");

		moveStateRequest = new MoveStateRequest();
		moveStateRequest.setStateId1(1);
		moveStateRequest.setStateId2(2);
		moveStateRequest.setStateIds(new int[]{1,2});
	}

	@Test
	@Order(1)
	public void testAddTaskStatusSuccessful() throws Exception {
		mockMvc.perform(post("/api/taskStatus/task-status")
						.contentType(MediaType.APPLICATION_JSON)
						.content(objectMapper.writeValueAsString(taskStatusDTO)))
				.andExpect(status().isOk())
				.andExpect(content().string("Status saved successfully"));

		mockMvc.perform(post("/api/taskStatus/task-status")
						.contentType(MediaType.APPLICATION_JSON)
						.content(objectMapper.writeValueAsString(taskStatus2DTO)))
				.andExpect(status().isOk())
				.andExpect(content().string("Status saved successfully"));
	}

	@Test
	public void testAddTaskStatusUserNotFound() throws Exception {
		taskStatusDTO.setEmail("notExist@gmail.com");
		mockMvc.perform(post("/api/taskStatus/task-status")
						.contentType(MediaType.APPLICATION_JSON)
						.content(objectMapper.writeValueAsString(taskStatusDTO)))
				.andExpect(status().isNotFound())
				.andExpect(content().string("Failed to add status"));
	}

	@Test
	@Order(2)
	public void testGetAllStatusesSuccessful() throws Exception {
		mockMvc.perform(get("/api/taskStatus/task-status")
						.contentType(MediaType.APPLICATION_JSON)
						.param("email", "prueba@gmail.com"))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$[0].status").value(taskStatusDTO.getStatus()))
				.andExpect(jsonPath("$[1].status").value(taskStatus2DTO.getStatus()));
	}

	@Test
	public void testGetAllStatusesUserNotFound() throws Exception {
		mockMvc.perform(get("/api/taskStatus/task-status")
						.contentType(MediaType.APPLICATION_JSON)
						.param("email", "notExist@gmail.com"))
				.andExpect(status().isNotFound())
				.andExpect(content().string("Failed to get all statuses"));
	}

	@Test
	public void testMoveStateSuccessful() throws Exception {
		mockMvc.perform(put("/api/taskStatus/move-state")
						.contentType(MediaType.APPLICATION_JSON)
						.content(objectMapper.writeValueAsString(moveStateRequest)))
				.andExpect(status().isOk())
				.andExpect(content().string("States moved successfully"));
	}

	@Test
	public void testMoveStateIllegalArgumentExceptionIds() throws Exception {
		moveStateRequest.setStateIds(new int[]{});

		mockMvc.perform(put("/api/taskStatus/move-state")
						.contentType(MediaType.APPLICATION_JSON)
						.content(objectMapper.writeValueAsString(moveStateRequest)))
				.andExpect(status().isBadRequest())
				.andExpect(content().string("User task status IDs array is null or empty"));
	}

	@Test
	public void testMoveStateIllegalArgumentExceptionIndex() throws Exception {
		moveStateRequest.setStateId1(8);

		mockMvc.perform(put("/api/taskStatus/move-state")
						.contentType(MediaType.APPLICATION_JSON)
						.content(objectMapper.writeValueAsString(moveStateRequest)))
				.andExpect(status().isBadRequest())
				.andExpect(content().string("One or both of the provided TaskStatus IDs do not exist"));
	}
	@Test
	public void testMoveTaskSuccessful() throws Exception {
		moveStateRequest.setStateIds(new int[]{1,3});
		moveStateRequest.setStateId1(1);
		moveStateRequest.setStateId2(3);

		mockMvc.perform(put("/api/tasks/move-state")
						.contentType(MediaType.APPLICATION_JSON)
						.content(objectMapper.writeValueAsString(moveStateRequest)))
				.andExpect(status().isOk())
				.andExpect(content().string("Tasks moved successfully"));
	}

	@Test
	public void testMoveTaskIllegalArgumentExceptionIds() throws Exception {
		moveStateRequest.setStateIds(new int[]{});

		mockMvc.perform(put("/api/tasks/move-state")
						.contentType(MediaType.APPLICATION_JSON)
						.content(objectMapper.writeValueAsString(moveStateRequest)))
				.andExpect(status().isBadRequest())
				.andExpect(content().string("User task IDs array is null or empty"));
	}

	@Test
	public void testMoveTaskIllegalArgumentExceptionIndex() throws Exception {
		moveStateRequest.setStateId1(12);
		moveStateRequest.setStateId2(13);

		mockMvc.perform(put("/api/tasks/move-state")
						.contentType(MediaType.APPLICATION_JSON)
						.content(objectMapper.writeValueAsString(moveStateRequest)))
				.andExpect(status().isBadRequest())
				.andExpect(content().string("One or both of the provided Task IDs do not exist"));
	}

	@Test
	public void testMoveSuccessful() throws Exception {
		moveStateRequest.setStateId1(2);
		moveStateRequest.setStateId2(1);

		mockMvc.perform(put("/api/tasks/move")
						.contentType(MediaType.APPLICATION_JSON)
						.content(objectMapper.writeValueAsString(moveStateRequest)))
				.andExpect(status().isOk())
				.andExpect(content().string("Tasks moved successfully"));
	}

	@Test
	public void testMoveIllegalArgumentException() throws Exception {
		moveStateRequest.setStateId1(8);
		moveStateRequest.setStateId2(9);

		mockMvc.perform(put("/api/tasks/move")
						.contentType(MediaType.APPLICATION_JSON)
						.content(objectMapper.writeValueAsString(moveStateRequest)))
				.andExpect(status().isBadRequest())
				.andExpect(content().string("Task and status not exist"));
	}

	@Test
	@Order(3)
	public void testRegisterTaskSuccessful() throws Exception {
		mockMvc.perform(post("/api/jobs")
						.contentType(MediaType.APPLICATION_JSON)
						.content(objectMapper.writeValueAsString(jobDTO)))
				.andExpect(status().isOk());

		mockMvc.perform(post("/api/tasks")
						.contentType(MediaType.APPLICATION_JSON)
						.content(objectMapper.writeValueAsString(taskDTO)))
				.andExpect(status().isOk())
				.andExpect(content().string("Task saved successfully"));

		mockMvc.perform(post("/api/tasks")
						.contentType(MediaType.APPLICATION_JSON)
						.content(objectMapper.writeValueAsString(task2DTO)))
				.andExpect(status().isOk())
				.andExpect(content().string("Task saved successfully"));

		mockMvc.perform(post("/api/tasks")
						.contentType(MediaType.APPLICATION_JSON)
						.content(objectMapper.writeValueAsString(task3DTO)))
				.andExpect(status().isOk())
				.andExpect(content().string("Task saved successfully"));
	}

	@Test
	public void testRegisterTaskFailure() throws Exception {
		taskDTO.setAssignedTo(new String[]{"john@gmail.com"});

		mockMvc.perform(post("/api/tasks")
						.contentType(MediaType.APPLICATION_JSON)
						.content(objectMapper.writeValueAsString(taskDTO)))
				.andExpect(status().isBadRequest());
	}

	@Test
	public void testGetTasksByAssignedToSuccessful() throws Exception {
		mockMvc.perform(get("/api/tasks/prueba@gmail.com"))
				.andExpect(status().isOk())
				.andExpect(content().contentType(MediaType.APPLICATION_JSON))
				.andExpect(jsonPath("$[0].name").value(taskDTO.getName()));
	}

	@Test
	public void testGetTasksByAssignedToNotExist() throws Exception {
		mockMvc.perform(get("/api/tasks/notExist@gmail.com")
						.contentType(MediaType.APPLICATION_JSON))
				.andExpect(status().isNotFound())
				.andExpect(content().string("Failed to get tasks"));
	}

	@Test
	public void testGetTasksByJobSuccessful() throws Exception {
		mockMvc.perform(get("/api/tasks/Job2/job")
						.contentType(MediaType.APPLICATION_JSON)
						.param("user", "prueba@gmail.com"))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$[0].name").value(taskDTO.getName()));
	}

	@Test
	public void testGetTasksByJobFailure() throws Exception {
		mockMvc.perform(get("/api/tasks/Job2/job")
						.contentType(MediaType.APPLICATION_JSON)
						.param("user", "john@gmail.com"))
				.andExpect(status().isBadRequest());
	}

	@Test
	public void testGetTaskByIdSuccessful() throws Exception {
		mockMvc.perform(get("/api/tasks/1/id"))
				.andExpect(status().isOk())
				.andExpect(content().contentType(MediaType.APPLICATION_JSON))
				.andExpect(jsonPath("$.name").value(taskDTO.getName()));
	}

	@Test
	public void testGetTaskByIdFailure() throws Exception {
		mockMvc.perform(get("/api/tasks/9/id")
						.contentType(MediaType.APPLICATION_JSON))
				.andExpect(status().isNotFound())
				.andExpect(content().string("Failed to get task"));
	}

	@Test
	@Order(Integer.MAX_VALUE)
	public void testDeleteTaskByIdSuccessful() throws Exception {
		mockMvc.perform(delete("/api/tasks/1/id")
						.contentType(MediaType.APPLICATION_JSON)
						.param("user", "prueba@gmail.com"))
				.andExpect(status().isOk())
				.andExpect(content().string("Deleted successfully"));
	}

	@Test
	public void testDeleteTaskByIdFailure() throws Exception {
		mockMvc.perform(delete("/api/tasks/8/id")
						.contentType(MediaType.APPLICATION_JSON)
						.param("user", "prueba@gmail.com"))
				.andExpect(status().isNotFound());
	}

	@Test
	@Order(Integer.MAX_VALUE)
	public void testDeleteTaskByStatusSuccessful() throws Exception {
		mockMvc.perform(delete("/api/tasks/2")
						.contentType(MediaType.APPLICATION_JSON))
				.andExpect(status().isOk())
				.andExpect(content().string("Deleted successfully"));
	}

	@Test
	public void testDeleteTaskByStatusFailure() throws Exception {
		mockMvc.perform(delete("/api/tasks/4")
						.contentType(MediaType.APPLICATION_JSON))
				.andExpect(status().isNotFound())
				.andExpect(content().string("Failed to delete by task status"));
	}

	@Test
	public void testUpdateTaskSuccessful() throws Exception {
		taskDTO.setPercentage(50);

		mockMvc.perform(put("/api/tasks/1")
						.contentType(MediaType.APPLICATION_JSON)
						.param("user", "prueba@gmail.com")
						.content(objectMapper.writeValueAsString(taskDTO)))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.percentage").value(taskDTO.getPercentage()));
	}

	@Test
	public void testUpdateTaskFailure() throws Exception {
		mockMvc.perform(put("/api/tasks/1")
						.contentType(MediaType.APPLICATION_JSON)
						.param("user", "john@gmail.com")
						.content(objectMapper.writeValueAsString(taskDTO)))
				.andExpect(status().isBadRequest());
	}

	@Test
	public void testUpdateTaskByStatusSuccessful() throws Exception {
		mockMvc.perform(put("/api/tasks/2/FINISHED")
						.contentType(MediaType.APPLICATION_JSON))
				.andExpect(status().isOk())
				.andExpect(content().string("Updated successfully"));
	}

	@Test
	public void testUpdateTaskByStatusFailure() throws Exception {
		mockMvc.perform(put("/api/tasks/7/FINISHED")
						.contentType(MediaType.APPLICATION_JSON))
				.andExpect(status().isNotFound())
				.andExpect(content().string("Failed to update by task status"));
	}
}

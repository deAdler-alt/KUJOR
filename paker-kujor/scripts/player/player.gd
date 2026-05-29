extends CharacterBody2D

const SPEED := 90.0

@onready var sprite: ColorRect = $Visual
@onready var interact_area: Area2D = $InteractArea
@onready var interact_collision: CollisionShape2D = $InteractArea/CollisionShape2D

var _facing := Vector2.DOWN
var _nearby_interactables: Array[Node] = []


func _ready() -> void:
	add_to_group("player")
	global_position = GameState.player_position
	GameState.player_lock_changed.connect(_on_player_lock_changed)


func _physics_process(_delta: float) -> void:
	if GameState.player_locked:
		velocity = Vector2.ZERO
		move_and_slide()
		return

	var input_dir := Vector2(
		Input.get_action_strength("move_right") - Input.get_action_strength("move_left"),
		Input.get_action_strength("move_down") - Input.get_action_strength("move_up")
	)
	if input_dir.length_squared() > 0.001:
		input_dir = input_dir.normalized()
		_facing = input_dir
	velocity = input_dir * SPEED
	move_and_slide()
	GameState.player_position = global_position
	_update_visual()


func _unhandled_input(event: InputEvent) -> void:
	if GameState.player_locked:
		return
	if event.is_action_pressed("interact"):
		_try_interact()


func _try_interact() -> void:
	if _nearby_interactables.is_empty():
		return
	var best: Node = null
	var best_dist := INF
	for node in _nearby_interactables:
		if not is_instance_valid(node):
			continue
		var d := global_position.distance_squared_to(node.global_position)
		if d < best_dist:
			best_dist = d
			best = node
	if best and best.has_method("on_interact"):
		best.on_interact(self)


func _on_player_lock_changed(_locked: bool) -> void:
	if GameState.player_locked:
		velocity = Vector2.ZERO


func _update_visual() -> void:
	if velocity.length_squared() > 1.0:
		sprite.color = Color(0.3, 0.7, 1.0)
	else:
		sprite.color = Color(0.2, 0.5, 0.9)
	if absf(_facing.x) > absf(_facing.y):
		sprite.size = Vector2(14, 16)
	else:
		sprite.size = Vector2(16, 14)


func register_interactable(node: Node) -> void:
	if node not in _nearby_interactables:
		_nearby_interactables.append(node)


func unregister_interactable(node: Node) -> void:
	_nearby_interactables.erase(node)
